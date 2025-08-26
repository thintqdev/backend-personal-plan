const MonthlyReport = require("../models/MonthlyReport");
const Transaction = require("../models/Transaction");
const FinanceJar = require("../models/FinanceJar");
const User = require("../models/User");
const PDFDocument = require("pdfkit");

// GET /api/finance/reports - Lấy danh sách báo cáo hàng tháng
exports.getMonthlyReports = async (req, res) => {
  try {
    const { year, month, limit } = req.query;
    const filter = {};

    // Giả sử chỉ có 1 user
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    filter.userId = user._id;

    if (year) filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);

    let query = MonthlyReport.find(filter)
      .populate("jarsReport.jarId", "name color icon category")
      .sort({ year: -1, month: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const reports = await query;
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/reports/:year/:month - Lấy báo cáo theo tháng/năm cụ thể
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;

    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const report = await MonthlyReport.findOne({
      userId: user._id,
      year: parseInt(year),
      month: parseInt(month),
    }).populate("jarsReport.jarId", "name color icon category");

    if (!report) {
      return res.status(404).json({ error: "Monthly report not found" });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/finance/reports/generate - Tạo báo cáo cho tháng hiện tại (manual)
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.body;
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Kiểm tra xem báo cáo đã tồn tại chưa
    const existingReport = await MonthlyReport.findOne({
      userId: user._id,
      year: targetYear,
      month: targetMonth,
    });

    if (existingReport && existingReport.isFinalized) {
      return res.status(400).json({
        error: "Monthly report already exists and is finalized",
      });
    }

    const report = await generateReport(user._id, targetYear, targetMonth);
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/finance/reports/:year/:month/finalize - Khóa báo cáo
exports.finalizeMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;

    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const report = await MonthlyReport.findOne({
      userId: user._id,
      year: parseInt(year),
      month: parseInt(month),
    });

    if (!report) {
      return res.status(404).json({ error: "Monthly report not found" });
    }

    if (report.isFinalized) {
      return res.status(400).json({ error: "Report is already finalized" });
    }

    // Khóa báo cáo và cộng dồn tiết kiệm vào tháng sau
    report.isFinalized = true;
    report.finalizedAt = new Date();
    await report.save();

    // Cộng dồn tiết kiệm vào tháng sau
    await carryOverSavings(user._id, parseInt(year), parseInt(month));

    res.json({
      message: "Report finalized successfully",
      report,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/reports/:year/:month/pdf-data - Lấy data để frontend tạo PDF
exports.getPDFReportData = async (req, res) => {
  try {
    const { year, month } = req.params;

    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const report = await MonthlyReport.findOne({
      userId: user._id,
      year: parseInt(year),
      month: parseInt(month),
    }).populate("jarsReport.jarId", "name color icon category");

    if (!report) {
      return res.status(404).json({ error: "Monthly report not found" });
    }

    // Tính toán category spending
    const categorySpending = {};
    report.jarsReport.forEach((jar) => {
      jar.transactions.forEach((transaction) => {
        if (transaction.type === "expense") {
          if (!categorySpending[transaction.category]) {
            categorySpending[transaction.category] = 0;
          }
          categorySpending[transaction.category] += transaction.amount;
        }
      });
    });

    // Sắp xếp category theo amount giảm dần
    const sortedCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          report.totalSpent > 0
            ? ((amount / report.totalSpent) * 100).toFixed(1)
            : "0.0",
      }));

    // Tính savings percentage cho từng jar
    const jarsWithPercentage = report.jarsReport.map((jar) => ({
      ...jar._doc,
      savingsPercentage:
        jar.allocatedAmount > 0
          ? ((jar.savings / jar.allocatedAmount) * 100).toFixed(1)
          : "0.0",
      jarInfo: jar.jarId
        ? {
            name: jar.jarId.name,
            color: jar.jarId.color,
            icon: jar.jarId.icon,
            category: jar.jarId.category,
          }
        : null,
    }));

    // Chuẩn bị data cho PDF
    const pdfData = {
      // Thông tin cơ bản
      reportInfo: {
        year: parseInt(year),
        month: parseInt(month),
        createdAt: new Date().toLocaleString("vi-VN"),
        isFinalized: report.isFinalized,
        finalizedAt: report.finalizedAt,
      },

      // Thông tin user
      user: {
        name: user.name,
        email: user.email,
        income: user.income,
      },

      // Tổng quan tài chính
      summary: {
        userIncome: report.userIncome,
        totalAllocated: report.totalAllocated,
        totalSpent: report.totalSpent,
        totalSavings: report.totalSavings,
        carryOverFromPreviousMonth: report.carryOverFromPreviousMonth,
        carryOverToNextMonth: report.carryOverToNextMonth,
      },

      // Chi tiết jars
      jarsReport: jarsWithPercentage,

      // Chi tiêu theo category
      categorySpending: sortedCategories,

      // Formatted currency strings cho display
      formatted: {
        userIncome: formatCurrency(report.userIncome),
        totalAllocated: formatCurrency(report.totalAllocated),
        totalSpent: formatCurrency(report.totalSpent),
        totalSavings: formatCurrency(report.totalSavings),
        carryOverFromPreviousMonth: formatCurrency(
          report.carryOverFromPreviousMonth
        ),
        carryOverToNextMonth: formatCurrency(report.carryOverToNextMonth),
        jars: jarsWithPercentage.map((jar) => ({
          ...jar,
          allocatedAmountFormatted: formatCurrency(jar.allocatedAmount),
          actualSpentFormatted: formatCurrency(jar.actualSpent),
          actualIncomeFormatted: formatCurrency(jar.actualIncome),
          savingsFormatted: formatCurrency(jar.savings),
        })),
        categories: sortedCategories.map((cat) => ({
          ...cat,
          amountFormatted: formatCurrency(cat.amount),
        })),
      },

      // Colors for styling
      colors: {
        primary: "#2E86AB",
        secondary: "#A23B72",
        success: "#28a745",
        danger: "#dc3545",
        warning: "#ffc107",
        info: "#17a2b8",
        dark: "#333333",
        muted: "#6c757d",
        light: "#f8f9fa",
      },
    };

    res.json(pdfData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/finance/reports/:year/:month/pdf - Simplified PDF endpoint (redirect to pdf-data)
exports.generatePDFReport = async (req, res) => {
  // Redirect to pdf-data endpoint for frontend handling
  const { year, month } = req.params;
  res.redirect(`/api/reports/monthly/${year}/${month}/pdf-data`);
};

// Hàm generate báo cáo (dùng chung cho cron job và manual)
async function generateReport(userId, year, month) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Tạo ngày bắt đầu và kết thúc tháng
  const startDate = new Date(year, month - 1, 1); // month - 1 vì JS month bắt đầu từ 0
  const endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng

  // Lấy tất cả jar đang active
  const jars = await FinanceJar.find({ isActive: true });

  // Lấy tất cả transaction trong tháng
  const transactions = await Transaction.find({
    date: { $gte: startDate, $lte: endDate },
  }).populate("jarId");

  // Tính toán cho từng jar
  const jarsReport = [];
  let totalSpent = 0;
  let totalIncome = 0;

  for (const jar of jars) {
    const jarTransactions = transactions.filter(
      (t) => t.jarId && t.jarId._id.toString() === jar._id.toString()
    );

    const actualSpent = jarTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const actualIncome = jarTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const allocatedAmount = (user.income * jar.percentage) / 100;
    const savings = allocatedAmount - actualSpent;

    totalSpent += actualSpent;
    totalIncome += actualIncome;

    jarsReport.push({
      jarId: jar._id,
      jarName: jar.name,
      jarCategory: jar.category,
      allocatedAmount,
      actualSpent,
      actualIncome,
      savings,
      percentage: jar.percentage,
      transactions: jarTransactions.map((t) => ({
        transactionId: t._id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        category: t.category,
        date: t.date,
      })),
    });
  }

  // Lấy carry over từ tháng trước
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  const previousReport = await MonthlyReport.findOne({
    userId,
    year: previousYear,
    month: previousMonth,
  });

  const carryOverFromPreviousMonth = previousReport
    ? previousReport.carryOverToNextMonth
    : 0;

  // Tính tổng
  const totalAllocated = jars.reduce(
    (sum, jar) => sum + (user.income * jar.percentage) / 100,
    0
  );
  const totalSavings = jarsReport.reduce((sum, jar) => sum + jar.savings, 0);
  const carryOverToNextMonth = totalSavings + carryOverFromPreviousMonth;

  // Tạo hoặc cập nhật báo cáo
  const reportData = {
    userId,
    month,
    year,
    userIncome: user.income,
    totalAllocated,
    totalSpent,
    totalSavings,
    carryOverFromPreviousMonth,
    carryOverToNextMonth,
    jarsReport,
  };

  const report = await MonthlyReport.findOneAndUpdate(
    { userId, year, month },
    reportData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("jarsReport.jarId", "name color icon category");

  return report;
}

// Hàm cộng dồn tiết kiệm vào tháng sau
async function carryOverSavings(userId, year, month) {
  // Logic này sẽ được implement khi cần
  // Có thể tự động thêm transaction income vào các jar dựa trên savings
  console.log(`Carrying over savings from ${year}/${month} to next month`);
}

// Helper function để format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Export hàm để dùng trong cron job
exports.generateReport = generateReport;
exports.carryOverSavings = carryOverSavings;
