const mongoose = require("mongoose");

const transactionSummarySchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ["income", "expense"] },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const jarReportSchema = new mongoose.Schema(
  {
    jarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceJar",
      required: true,
    },
    jarName: { type: String, required: true }, // Lưu tên jar tại thời điểm báo cáo
    jarCategory: { type: String, required: true },
    allocatedAmount: { type: Number, required: true }, // Số tiền được phân bổ cho jar trong tháng
    actualSpent: { type: Number, default: 0 }, // Số tiền thực tế đã chi tiêu
    actualIncome: { type: Number, default: 0 }, // Số tiền thực tế thu về cho jar
    savings: { type: Number, default: 0 }, // Tiết kiệm = allocatedAmount - actualSpent
    percentage: { type: Number, required: true }, // % phân bổ tại thời điểm báo cáo
    transactions: [transactionSummarySchema],
  },
  { _id: false }
);

const monthlyReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 }, // 1-12
    year: { type: Number, required: true },
    userIncome: { type: Number, required: true }, // Thu nhập của user trong tháng
    totalAllocated: { type: Number, required: true }, // Tổng tiền được phân bổ
    totalSpent: { type: Number, default: 0 }, // Tổng tiền đã chi tiêu
    totalSavings: { type: Number, default: 0 }, // Tổng tiết kiệm
    carryOverFromPreviousMonth: { type: Number, default: 0 }, // Dư từ tháng trước
    carryOverToNextMonth: { type: Number, default: 0 }, // Dư chuyển sang tháng sau
    jarsReport: [jarReportSchema], // Báo cáo từng jar
    isFinalized: { type: Boolean, default: false }, // Đã khóa báo cáo chưa
    finalizedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
monthlyReportSchema.index({ userId: 1, year: -1, month: -1 });
monthlyReportSchema.index({ year: -1, month: -1 });

// Đảm bảo chỉ có 1 báo cáo cho mỗi tháng của user
monthlyReportSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyReport", monthlyReportSchema);
