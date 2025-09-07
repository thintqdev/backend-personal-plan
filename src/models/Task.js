const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, required: true }, // The Hai, The Ba, ...
    type: { type: String, required: true }, // Study, Work, Gym, ...
    time: { type: String, required: true }, // VD: 08:00 - 09:00
    task: { type: String, required: true }, // Renamed from description
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
