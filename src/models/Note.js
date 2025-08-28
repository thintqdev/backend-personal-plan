const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NoteFolder",
            required: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        isArchived: {
            type: Boolean,
            default: false,
        },
        isFavorite: {
            type: Boolean,
            default: false,
        },
        lastViewedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Add index for better search performance
noteSchema.index({ title: "text", content: "text" });
noteSchema.index({ folderId: 1, createdAt: -1 });

const noteFolderSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            default: "#6B7280",
        },
        icon: {
            type: String,
            default: "folder",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Note = mongoose.model("Note", noteSchema);
const NoteFolder = mongoose.model("NoteFolder", noteFolderSchema);

module.exports = { Note, NoteFolder };