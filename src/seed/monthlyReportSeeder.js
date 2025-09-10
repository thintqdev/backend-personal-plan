require("dotenv").config();
const mongoose = require("mongoose");
const { runManualMonthlyReport } = require("../services/cronService");

async function connectToDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
}

async function seedMonthlyReport(userId) {
  if (!userId) throw new Error("Thiếu userId khi seed monthly report");
  await connectToDatabase();
  try {
    console.log("Generating monthly report for current month...");
    const report = await runManualMonthlyReport(userId);
    console.log("Monthly report generated successfully!");
    console.log("Report summary:", {
      month: report.month,
      year: report.year,
      userIncome: report.userIncome,
      totalAllocated: report.totalAllocated,
      totalSpent: report.totalSpent,
      totalSavings: report.totalSavings,
      carryOverToNextMonth: report.carryOverToNextMonth,
      jarsCount: report.jarsReport.length,
    });
  } catch (error) {
    console.error("Error generating monthly report:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
}

if (require.main === module) {
  require("dotenv").config();
  (async () => {
    await connectToDatabase();
    const User = require("../models/User");
    const user = await User.findOne();
    if (!user) throw new Error("Chưa có user để seed monthly report");
    await seedMonthlyReport(user._id);
  })();
}

module.exports = seedMonthlyReport;
