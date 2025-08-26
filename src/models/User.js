const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    goal: { type: String },
    streak: { type: Number, default: 0 },
    avatar: { type: String }, // link ảnh avatar
    income: { type: Number, default: 0 }, // thu nhập hàng tháng
    preferences: {
      theme: { type: String, default: "violet" },
      coverImage: { type: String },
      notifications: { type: Boolean, default: true },
      language: { type: String, default: "vi" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
