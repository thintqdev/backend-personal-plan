const Dairy = require("../models/Dairy");

// GET /api/dairies - Lấy tất cả dairies
exports.getAllDairies = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    const dairies = await Dairy.find({ userId }).sort({ createdAt: -1 });
    res.json(dairies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/dairies/:id - Lấy dairy theo ID
exports.getDairyById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const dairy = await Dairy.findOne({ _id: id, userId });

    if (!dairy) {
      return res
        .status(404)
        .json({ error: "Dairy not found or access denied" });
    }

    res.json(dairy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/dairies - Tạo dairy mới
exports.createDairy = async (req, res) => {
  try {
    const {
      title,
      content,
      mood,
      tags,
      isPublic,
      userId: bodyUserId,
    } = req.body;
    const userId = req.user?._id || bodyUserId;

    if (!userId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    const dairyData = {
      userId,
      title,
      content,
      mood: mood || 0,
      tags: tags || [],
      isPublic: isPublic || false,
    };

    const newDairy = new Dairy(dairyData);
    await newDairy.save();

    res.status(201).json(newDairy);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/dairies/:id - Cập nhật dairy
exports.updateDairy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      mood,
      tags,
      isPublic,
      userId: bodyUserId,
    } = req.body;
    const userId = req.user?._id || bodyUserId;

    if (!userId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (mood !== undefined) updateData.mood = mood;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedDairy = await Dairy.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDairy) {
      return res
        .status(404)
        .json({ error: "Dairy not found or access denied" });
    }

    res.json(updatedDairy);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/dairies/:id - Xóa dairy
exports.deleteDairy = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "User authentication required" });
    }

    const deletedDairy = await Dairy.findOneAndDelete({ _id: id, userId });

    if (!deletedDairy) {
      return res
        .status(404)
        .json({ error: "Dairy not found or access denied" });
    }

    res.json({ message: "Dairy deleted successfully", dairy: deletedDairy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/dairies/filter?mood=1&isPublic=true
exports.getDairiesByFilter = async (req, res) => {
  try {
    const { mood, isPublic, tags } = req.query;
    const userId = req.user._id;
    const filter = { userId };

    if (mood !== undefined) filter.mood = parseInt(mood);
    if (isPublic !== undefined) filter.isPublic = isPublic === "true";
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    const dairies = await Dairy.find(filter).sort({ createdAt: -1 });
    res.json(dairies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/dairies/stats - Thống kê dairies
exports.getDairyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalDairies = await Dairy.countDocuments({ userId });
    const publicDairies = await Dairy.countDocuments({
      userId,
      isPublic: true,
    });
    const privateDairies = await Dairy.countDocuments({
      userId,
      isPublic: false,
    });

    // Mood statistics
    const moodStats = await Dairy.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$mood",
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly statistics
    const monthlyStats = await Dairy.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    // Tags statistics
    const tagStats = await Dairy.aggregate([
      { $match: { userId } },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentDairies = await Dairy.countDocuments({
      userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      totalDairies,
      publicDairies,
      privateDairies,
      recentDairies,
      moodBreakdown: moodStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      monthlyActivity: monthlyStats,
      topTags: tagStats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/dairies/search?q=keyword - Tìm kiếm dairies
exports.searchDairies = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const dairies = await Dairy.find({
      userId,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    }).sort({ createdAt: -1 });

    res.json(dairies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
