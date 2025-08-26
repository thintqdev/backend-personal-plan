const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    jarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceJar",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },
    description: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
transactionSchema.index({ jarId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });

// Middleware to update jar's currentAmount when transaction is saved
transactionSchema.post("save", async function () {
  const FinanceJar = mongoose.model("FinanceJar");
  await updateJarAmount(FinanceJar, this.jarId);
});

// Middleware to update jar's currentAmount when transaction is removed
transactionSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const FinanceJar = mongoose.model("FinanceJar");
    await updateJarAmount(FinanceJar, doc.jarId);
  }
});

// Helper function to update jar's current amount
async function updateJarAmount(FinanceJar, jarId) {
  const Transaction = mongoose.model("Transaction");

  const result = await Transaction.aggregate([
    { $match: { jarId: jarId } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const currentAmount =
    result.length > 0 ? result[0].totalIncome - result[0].totalExpense : 0;
  await FinanceJar.findByIdAndUpdate(jarId, {
    currentAmount: currentAmount, // Cho phép balance âm
  });
}

module.exports = mongoose.model("Transaction", transactionSchema);
