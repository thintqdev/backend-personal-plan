const Transaction = require("../models/Transaction");
const FinanceJar = require("../models/FinanceJar");
const mongoose = require("mongoose");

// GET /api/finance/transactions - Lấy tất cả transactions với pagination và filtering
exports.getAllTransactions = async (req, res) => {
  try {
    const {
      jarId,
      type,
      category,
      startDate,
      endDate,
      month, // YYYY-MM format
      dateFilter, // YYYY-MM-DD format
      search,
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const userId = req.user._id;
    const filter = { userId };

    // Jar filter
    if (jarId && jarId !== "all") {
      filter.jarId = jarId;
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Month filter (YYYY-MM)
    if (month) {
      const monthStart = new Date(month + "-01");
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );
      filter.date = {
        $gte: monthStart,
        $lte: monthEnd,
      };
    }

    // Specific date filter (YYYY-MM-DD)
    if (dateFilter) {
      const dayStart = new Date(dateFilter);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.date = {
        $gte: dayStart,
        $lt: dayEnd,
      };
    }

    // Search filter (description, category, jar name)
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [{ description: searchRegex }, { category: searchRegex }];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    if (sortBy !== "createdAt") {
      sortOptions.createdAt = -1; // Secondary sort
    }

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(filter);

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .populate("jarId", "name color icon")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Filter by jar name if search is provided (since we can't do this in MongoDB query)
    let filteredTransactions = transactions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTransactions = transactions.filter((transaction) => {
        const jarName = transaction.jarId?.name?.toLowerCase() || "";
        const descriptionMatch = transaction.description
          .toLowerCase()
          .includes(searchLower);
        const categoryMatch = transaction.category
          .toLowerCase()
          .includes(searchLower);
        const jarNameMatch = jarName.includes(searchLower);

        return descriptionMatch || categoryMatch || jarNameMatch;
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      transactions: filteredTransactions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        jarId,
        type,
        category,
        startDate,
        endDate,
        month,
        dateFilter,
        search,
        sortBy,
        sortOrder,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/transactions/:id - Lấy transaction theo ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const transaction = await Transaction.findOne({ _id: id, userId }).populate(
      "jarId",
      "name color icon"
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ error: "Transaction not found or access denied" });
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
    const userId = req.user._id;

    // Check if jar exists and belongs to user
    const jar = await FinanceJar.findOne({ _id: jarId, userId });
    if (!jar) {
      return res
        .status(404)
        .json({ error: "Finance jar not found or access denied" });
    }

    const filter = { jarId, userId };
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
    const userId = req.user._id;

    // Check if jar exists and belongs to user
    const jar = await FinanceJar.findOne({ _id: jarId, userId });
    if (!jar) {
      return res
        .status(404)
        .json({ error: "Finance jar not found or access denied" });
    }

    const transactionData = {
      userId,
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
    const userId = req.user._id;

    const currentTransaction = await Transaction.findOne({ _id: id, userId });
    if (!currentTransaction) {
      return res
        .status(404)
        .json({ error: "Transaction not found or access denied" });
    }

    // If jarId is being changed, check if new jar exists and belongs to user
    if (jarId && jarId !== currentTransaction.jarId.toString()) {
      const jar = await FinanceJar.findOne({ _id: jarId, userId });
      if (!jar) {
        return res
          .status(404)
          .json({ error: "Finance jar not found or access denied" });
      }
    }

    // Delete old transaction (this will trigger middleware to update old jar's currentAmount)
    await Transaction.findOneAndDelete({ _id: id, userId });

    // Create new transaction with updated data (this will trigger middleware to update new jar's currentAmount)
    const transactionData = {
      userId,
      jarId: jarId || currentTransaction.jarId,
      amount: amount !== undefined ? amount : currentTransaction.amount,
      type: type || currentTransaction.type,
      description:
        description !== undefined
          ? description
          : currentTransaction.description,
      category: category !== undefined ? category : currentTransaction.category,
      date: date ? new Date(date) : currentTransaction.date,
    };

    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();

    // Populate jar info before returning
    await newTransaction.populate("jarId", "name color icon");

    res.json(newTransaction);
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
    const userId = req.user._id;

    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedTransaction) {
      return res
        .status(404)
        .json({ error: "Transaction not found or access denied" });
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
    const userId = req.user._id;
    let matchFilter = { userId };

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
