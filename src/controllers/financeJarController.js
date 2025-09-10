const FinanceJar = require("../models/FinanceJar");
const Transaction = require("../models/Transaction");

// GET /api/finance/jars - Lấy tất cả jars
exports.getAllJars = async (req, res) => {
  try {
    const { isActive, priority, category } = req.query;
    const userId = req.user._id;
    const filter = { userId };

    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const jars = await FinanceJar.find(filter).sort({
      priority: 1,
      createdAt: -1,
    });
    res.json(jars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/jars/:id - Lấy jar theo ID
exports.getJarById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const jar = await FinanceJar.findOne({ _id: id, userId });

    if (!jar) {
      return res
        .status(404)
        .json({ error: "Finance jar not found or access denied" });
    }

    res.json(jar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/finance/jars - Tạo jar mới
exports.createJar = async (req, res) => {
  try {
    const {
      name,
      description,
      targetAmount,
      percentage,
      color,
      icon,
      priority,
      category,
    } = req.body;
    const userId = req.user._id;

    // Check if total percentage exceeds 100%
    const existingJars = await FinanceJar.find({ userId, isActive: true });
    const totalPercentage = existingJars.reduce(
      (sum, jar) => sum + jar.percentage,
      0
    );

    if (totalPercentage + percentage > 100) {
      return res.status(400).json({
        error: `Total percentage would exceed 100%. Current: ${totalPercentage}%, Adding: ${percentage}%`,
      });
    }

    const jarData = {
      userId,
      name,
      description,
      targetAmount,
      percentage,
      color,
      icon,
      priority,
      category,
      currentAmount: 0,
    };

    const newJar = new FinanceJar(jarData);
    await newJar.save();

    res.status(201).json(newJar);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/finance/jars/:id - Cập nhật jar
exports.updateJar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      targetAmount,
      percentage,
      color,
      icon,
      priority,
      category,
      isActive,
    } = req.body;
    const userId = req.user._id;

    const currentJar = await FinanceJar.findOne({ _id: id, userId });
    if (!currentJar) {
      return res
        .status(404)
        .json({ error: "Finance jar not found or access denied" });
    }

    // Check percentage if being updated
    if (percentage !== undefined && percentage !== currentJar.percentage) {
      const otherJars = await FinanceJar.find({
        userId,
        isActive: true,
        _id: { $ne: id },
      });
      const otherTotalPercentage = otherJars.reduce(
        (sum, jar) => sum + jar.percentage,
        0
      );

      if (otherTotalPercentage + percentage > 100) {
        return res.status(400).json({
          error: `Total percentage would exceed 100%. Other jars: ${otherTotalPercentage}%, New: ${percentage}%`,
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (targetAmount !== undefined) updateData.targetAmount = targetAmount;
    if (percentage !== undefined) updateData.percentage = percentage;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedJar = await FinanceJar.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(updatedJar);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/finance/jars/:id - Xóa jar
exports.deleteJar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if jar has transactions
    const transactionCount = await Transaction.countDocuments({
      jarId: id,
      userId,
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        error: `Cannot delete jar with ${transactionCount} transactions. Please delete transactions first.`,
      });
    }

    const deletedJar = await FinanceJar.findOneAndDelete({ _id: id, userId });
    if (!deletedJar) {
      return res
        .status(404)
        .json({ error: "Finance jar not found or access denied" });
    }

    res.json({ message: "Finance jar deleted successfully", jar: deletedJar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/overview - Lấy tổng quan tài chính
exports.getFinanceOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const activeJars = await FinanceJar.find({ userId, isActive: true });
    const allJars = await FinanceJar.find({ userId });

    // Calculate totals from transactions
    const transactionStats = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
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
        },
      },
    ]);

    const totalIncome =
      transactionStats.length > 0 ? transactionStats[0].totalIncome : 0;
    const totalExpenses =
      transactionStats.length > 0 ? transactionStats[0].totalExpenses : 0;
    const totalSavings = totalIncome - totalExpenses;

    const totalAllocated = activeJars.reduce(
      (sum, jar) => sum + jar.percentage,
      0
    );
    const remainingPercentage = 100 - totalAllocated;

    const overview = {
      totalIncome,
      totalExpenses,
      totalSavings: Math.max(0, totalSavings),
      jarsCount: allJars.length,
      activeJarsCount: activeJars.length,
      totalAllocated,
      remainingPercentage,
    };

    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
