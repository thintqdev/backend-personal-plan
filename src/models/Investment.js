const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Người dùng
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MAsset",
      required: true,
    }, // Tài sản đầu tư
    amount: { type: Number, required: true }, // Số tiền đầu tư
    date: { type: Date, required: true }, // Ngày đầu tư
    description: { type: String }, // Mô tả giao dịch đầu tư
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
