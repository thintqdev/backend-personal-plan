const mongoose = require("mongoose");

const coverSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
coverSchema.index({ isActive: 1, createdAt: -1 });

const Cover = mongoose.model("Cover", coverSchema);

module.exports = Cover;