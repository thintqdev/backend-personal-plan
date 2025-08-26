const Transaction = require("../models/Transaction");
const FinanceJar = require("../models/FinanceJar");

// GET /api/finance/transactions - Lấy tất cả transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { jarId, type, category, startDate, endDate, limit } = req.query;
    const filter = {};

    if (jarId) filter.jarId = jarId;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let query = Transaction.find(filter)
      .populate("jarId", "name color icon")
      .sort({ date: -1, createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const transactions = await query;
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/transactions/:id - Lấy transaction theo ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate(
      "jarId",
      "name color icon"
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/jars/:jarId/transactions - Lấy transactions của jar cụ thể
exports.getTransactionsByJar = async (req, res) => {
  try {
    const { jarId } = req.params;
    const { type, startDate, endDate, limit } = req.query;

    // Check if jar exists
    const jar = await FinanceJar.findById(jarId);
    if (!jar) {
      return res.status(404).json({ error: "Finance jar not found" });
    }

    const filter = { jarId };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let query = Transaction.find(filter)
      .populate("jarId", "name color icon")
      .sort({ date: -1, createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const transactions = await query;
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/finance/transactions - Tạo transaction mới
exports.createTransaction = async (req, res) => {
  try {
    const { jarId, amount, type, description, category, date } = req.body;

    // Check if jar exists
    const jar = await FinanceJar.findById(jarId);
    if (!jar) {
      return res.status(404).json({ error: "Finance jar not found" });
    }

    // For expense, check if jar has enough balance (optional - comment out to allow negative balance)
    // if (type === "expense") {
    //   if (jar.currentAmount < amount) {
    //     return res.status(400).json({
    //       error: `Insufficient balance. Current: ${jar.currentAmount}, Required: ${amount}`,
    //     });
    //   }
    // }

    const transactionData = {
      jarId,
      amount,
      type,
      description,
      category,
      date: date ? new Date(date) : new Date(),
    };

    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();

    // Populate jar info before returning
    await newTransaction.populate("jarId", "name color icon");

    res.status(201).json(newTransaction);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/finance/transactions/:id - Cập nhật transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { jarId, amount, type, description, category, date } = req.body;

    const currentTransaction = await Transaction.findById(id);
    if (!currentTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // If jarId is being changed, check if new jar exists
    if (jarId && jarId !== currentTransaction.jarId.toString()) {
      const jar = await FinanceJar.findById(jarId);
      if (!jar) {
        return res.status(404).json({ error: "Finance jar not found" });
      }
    }

    const updateData = {};
    if (jarId !== undefined) updateData.jarId = jarId;
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("jarId", "name color icon");

    res.json(updatedTransaction);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/finance/transactions/:id - Xóa transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      message: "Transaction deleted successfully",
      transaction: deletedTransaction,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/transactions/stats - Thống kê transactions
exports.getTransactionStats = async (req, res) => {
  try {
    const { jarId, startDate, endDate } = req.query;
    let matchFilter = {};

    if (jarId) matchFilter.jarId = mongoose.Types.ObjectId(jarId);
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) matchFilter.date.$gte = new Date(startDate);
      if (endDate) matchFilter.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
          incomeCount: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, 1, 0],
            },
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const categoryStats = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
            },
          },
          totalTransactions: { $sum: "$count" },
        },
      },
    ]);

    const result =
      stats.length > 0
        ? stats[0]
        : {
            totalTransactions: 0,
            totalIncome: 0,
            totalExpenses: 0,
            incomeCount: 0,
            expenseCount: 0,
          };

    result.netAmount = result.totalIncome - result.totalExpenses;
    result.categoryBreakdown = categoryStats;

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
