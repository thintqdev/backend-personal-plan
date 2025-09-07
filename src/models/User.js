const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    status: { type: Number, enum: [0, 1, 2], default: 1 }, // 0: inactive, 1: active, 2: banned
    verified_email_at: { type: Date },
    login_attempt: { type: Number, default: 0 },
    last_login: { type: Date },
    role: { type: String, required: false }, // ở đây chỉ ngành nghề của user thôi
    goal: { type: String }, // Đây như là bio của user
    streak: { type: Number, default: 0 }, // số ngày liên tục sử dụng app
    avatar: { type: String }, // link ảnh avatar
    income: { type: Number, default: 0 }, // thu nhập hàng tháng
    preferences: {
      theme: { type: String, default: "violet" },
      coverImage: { type: String },
      notifications: { type: Boolean, default: true },
      language: { type: String, default: "vi" },
    },
    subscription: {
      isActive: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
