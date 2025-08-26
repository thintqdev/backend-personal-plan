const mongoose = require("mongoose");

const subGoalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Not Started", "In Progress", "Completed", "On Hold"],
      default: "Not Started",
    },
    targetDate: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Not Started", "In Progress", "Completed", "On Hold"],
      default: "Not Started",
    },
    targetDate: { type: Date },
    subGoals: [subGoalSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);
