const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // Thứ Hai, Thứ Ba, ...
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
