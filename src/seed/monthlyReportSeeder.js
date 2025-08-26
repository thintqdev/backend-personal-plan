require("dotenv").config();
const mongoose = require("mongoose");
const { runManualMonthlyReport } = require("../services/cronService");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedMonthlyReport = async () => {
  try {
    console.log("Generating monthly report for current month...");
    const report = await runManualMonthlyReport();
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
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Chạy seeder
const runSeeder = async () => {
  await connectToDatabase();
  await seedMonthlyReport();
};

if (require.main === module) {
  runSeeder();
}

module.exports = { seedMonthlyReport };
