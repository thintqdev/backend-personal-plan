const mongoose = require("mongoose");

const dairySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  /**
   * mood: trạng thái cảm xúc
   * 0: neutral, 1: happy, 2: sad, 3: angry, 4: excited, 5: tired, 6: other
   */
  mood: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6],
    default: 0,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

dairySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Dairy", dairySchema);
