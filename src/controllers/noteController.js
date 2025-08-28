const { Note, NoteFolder } = require("../models/Note");

// ==================== FOLDER OPERATIONS ====================

// GET /api/notes/folders - Lấy tất cả folders
exports.getAllFolders = async (req, res) => {
    try {
        const folders = await NoteFolder.find().sort({ sortOrder: 1, createdAt: 1 });
        res.json(folders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/notes/folders - Tạo folder mới
exports.createFolder = async (req, res) => {
    try {
        const { label, color, icon } = req.body;

        if (!label || !label.trim()) {
            return res.status(400).json({ error: "Folder label is required" });
        }

        const folderData = {
            label: label.trim(),
            color: color || "#6B7280",
            icon: icon || "folder",
        };

        const newFolder = new NoteFolder(folderData);
        await newFolder.save();

        res.status(201).json(newFolder);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/notes/folders/:id - Cập nhật folder
exports.updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { label, color, icon, sortOrder } = req.body;

        const updateData = {};
        if (label !== undefined) updateData.label = label.trim();
        if (color !== undefined) updateData.color = color;
        if (icon !== undefined) updateData.icon = icon;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

        const updatedFolder = await NoteFolder.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedFolder) {
            return res.status(404).json({ error: "Folder not found" });
        }

        res.json(updatedFolder);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/notes/folders/:id - Xóa folder và tất cả notes bên trong
exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if folder exists
        const folder = await NoteFolder.findById(id);
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }

        // Don't allow deleting default folders
        if (folder.isDefault) {
            return res.status(400).json({ error: "Cannot delete default folder" });
        }

        // Delete all notes in this folder
        await Note.deleteMany({ folderId: id });

        // Delete the folder
        await NoteFolder.findByIdAndDelete(id);

        res.json({
            message: "Folder and all its notes deleted successfully",
            folder: folder
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== NOTE OPERATIONS ====================

// GET /api/notes - Lấy tất cả notes với thông tin folder
exports.getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({ isArchived: false })
            .populate("folderId", "label color icon")
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/notes/tree - Lấy cấu trúc cây notes theo folder
exports.getNotesTree = async (req, res) => {
    try {
        const folders = await NoteFolder.find().sort({ sortOrder: 1, createdAt: 1 });
        const notes = await Note.find({ isArchived: false }).sort({ createdAt: -1 });

        const notesTree = folders.map(folder => ({
            id: folder._id.toString(),
            label: folder.label,
            color: folder.color,
            icon: folder.icon,
            isDefault: folder.isDefault,
            sortOrder: folder.sortOrder,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            children: notes
                .filter(note => note.folderId.toString() === folder._id.toString())
                .map(note => ({
                    id: note._id.toString(),
                    title: note.title,
                    content: note.content,
                    tags: note.tags,
                    isFavorite: note.isFavorite,
                    lastViewedAt: note.lastViewedAt,
                    createdAt: note.createdAt,
                    updatedAt: note.updatedAt,
                }))
        }));

        res.json(notesTree);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/notes/:id - Lấy note theo ID
exports.getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id).populate("folderId", "label color icon");

        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Update last viewed timestamp
        note.lastViewedAt = new Date();
        await note.save();

        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/notes/folder/:folderId - Lấy notes theo folder
exports.getNotesByFolder = async (req, res) => {
    try {
        const { folderId } = req.params;

        // Verify folder exists
        const folder = await NoteFolder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }

        const notes = await Note.find({
            folderId: folderId,
            isArchived: false
        }).sort({ createdAt: -1 });

        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/notes - Tạo note mới
exports.createNote = async (req, res) => {
    try {
        const { title, content, folderId, tags } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: "Note title is required" });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({ error: "Note content is required" });
        }

        if (!folderId) {
            return res.status(400).json({ error: "Folder ID is required" });
        }

        // Verify folder exists
        const folder = await NoteFolder.findById(folderId);
        if (!folder) {
            return res.status(400).json({ error: "Invalid folder ID" });
        }

        const noteData = {
            title: title.trim(),
            content: content,
            folderId: folderId,
            tags: tags && Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
        };

        const newNote = new Note(noteData);
        await newNote.save();

        // Populate folder info before returning
        await newNote.populate("folderId", "label color icon");

        res.status(201).json(newNote);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/notes/:id - Cập nhật note
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, folderId, tags, isFavorite, isArchived } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content;
        if (folderId !== undefined) {
            // Verify folder exists
            const folder = await NoteFolder.findById(folderId);
            if (!folder) {
                return res.status(400).json({ error: "Invalid folder ID" });
            }
            updateData.folderId = folderId;
        }
        if (tags !== undefined) {
            updateData.tags = Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [];
        }
        if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
        if (isArchived !== undefined) updateData.isArchived = isArchived;

        const updatedNote = await Note.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("folderId", "label color icon");

        if (!updatedNote) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json(updatedNote);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/notes/:id - Xóa note
exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);

        if (!deletedNote) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json({ message: "Note deleted successfully", note: deletedNote });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/notes/search?q=query - Tìm kiếm notes
exports.searchNotes = async (req, res) => {
    try {
        const { q, folderId, tags } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({ error: "Search query is required" });
        }

        const searchFilter = {
            $text: { $search: q.trim() },
            isArchived: false,
        };

        if (folderId) {
            searchFilter.folderId = folderId;
        }

        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : [tags];
            searchFilter.tags = { $in: tagArray };
        }

        const notes = await Note.find(searchFilter, { score: { $meta: "textScore" } })
            .populate("folderId", "label color icon")
            .sort({ score: { $meta: "textScore" } });

        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/notes/stats - Thống kê notes
exports.getNoteStats = async (req, res) => {
    try {
        const totalNotes = await Note.countDocuments({ isArchived: false });
        const archivedNotes = await Note.countDocuments({ isArchived: true });
        const favoriteNotes = await Note.countDocuments({ isFavorite: true, isArchived: false });
        const totalFolders = await NoteFolder.countDocuments();

        // Notes by folder
        const notesByFolder = await Note.aggregate([
            { $match: { isArchived: false } },
            {
                $group: {
                    _id: "$folderId",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "notefolders",
                    localField: "_id",
                    foreignField: "_id",
                    as: "folder",
                },
            },
            {
                $unwind: "$folder",
            },
            {
                $project: {
                    folderName: "$folder.label",
                    count: 1,
                },
            },
        ]);

        // Recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentNotes = await Note.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
            isArchived: false,
        });

        res.json({
            totalNotes,
            archivedNotes,
            favoriteNotes,
            totalFolders,
            recentNotes,
            notesByFolder,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};