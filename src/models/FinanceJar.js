const mongoose = require("mongoose");

const financeJarSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    priority: {
      type: String,
      required: true,
      enum: ["High", "Medium", "Low"],
    },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
financeJarSchema.index({ isActive: 1 });
financeJarSchema.index({ priority: 1 });
financeJarSchema.index({ category: 1 });

module.exports = mongoose.model("FinanceJar", financeJarSchema);
