const cron = require("node-cron");
const { generateReport } = require("../controllers/monthlyReportController");
const User = require("../models/User");
const emailService = require("./emailService");
const { cleanupExpiredTokens } = require("../utils/tokenUtils");

// Cron job chạy vào ngày đầu tiên của tháng lúc 00:01
// Format: minute hour day month dayOfWeek
const monthlyReportCron = cron.schedule(
  "1 0 1 * *", // 00:01 ngày 1 hàng tháng
  async () => {
    console.log("Running monthly report generation...");
    try {
      const user = await User.findOne();
      if (!user) {
        console.error("No user found for monthly report generation");
        return;
      }

      const now = new Date();
      // Tạo báo cáo cho tháng vừa qua
      const currentMonth = now.getMonth() + 1; // getMonth() trả về 0-11, nên +1 để có 1-12
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const year =
        currentMonth === 1 ? now.getFullYear() - 1 : now.getFullYear();

      console.log(`Generating report for ${year}/${lastMonth}`);
      const report = await generateReport(user._id, year, lastMonth);

      console.log("Monthly report generated successfully:", {
        year,
        month: lastMonth,
        totalSavings: report.totalSavings,
        totalSpent: report.totalSpent,
      });
    } catch (error) {
      console.error("Error generating monthly report:", error);
    }
  },
  {
    scheduled: false, // Không tự động start
    timezone: "Asia/Ho_Chi_Minh",
  }
);

// Cron job để dọn dẹp email logs cũ - chạy hàng tuần vào Chủ nhật lúc 2:00 AM
const emailCleanupCron = cron.schedule(
  "0 2 * * 0", // 02:00 Chủ nhật hàng tuần
  async () => {
    console.log("Running email queue cleanup...");
    try {
      await emailService.cleanup(7 * 24 * 60 * 60 * 1000); // 7 days
      console.log("Email queue cleanup completed successfully");
    } catch (error) {
      console.error("Error during email queue cleanup:", error);
    }
  },
  {
    scheduled: false,
    timezone: "Asia/Ho_Chi_Minh"
  }
);

// Cron job để dọn dẹp activation tokens hết hạn - chạy hàng ngày lúc 3:00 AM
const tokenCleanupCron = cron.schedule(
  "0 3 * * *", // 03:00 hàng ngày
  async () => {
    console.log("Running activation tokens cleanup...");
    try {
      const deletedCount = await cleanupExpiredTokens();
      console.log(`Token cleanup completed: ${deletedCount} tokens removed`);
    } catch (error) {
      console.error("Error during token cleanup:", error);
    }
  },
  {
    scheduled: false,
    timezone: "Asia/Ho_Chi_Minh"
  }
);

// Khởi động các cron jobs
function startCronJobs() {
  console.log("Starting monthly report cron job...");
  monthlyReportCron.start();

  console.log("Starting email cleanup cron job...");
  emailCleanupCron.start();

  console.log("Starting token cleanup cron job...");
  tokenCleanupCron.start();

  // Uncomment để test
  // console.log("Starting test cron job...");
  // testCron.start();
}

// Dừng các cron jobs
function stopCronJobs() {
  console.log("Stopping monthly report cron job...");
  monthlyReportCron.stop();

  console.log("Stopping email cleanup cron job...");
  emailCleanupCron.stop();

  console.log("Stopping token cleanup cron job...");
  tokenCleanupCron.stop();
}

// Chạy manual monthly report cho tháng hiện tại
async function runManualMonthlyReport() {
  try {
    const user = await User.findOne();
    if (!user) {
      throw new Error("No user found");
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // +1 vì getMonth() trả về 0-11

    console.log(`Running manual monthly report for ${year}/${month}`);
    const report = await generateReport(user._id, year, month);

    console.log("Manual monthly report completed:", {
      year,
      month,
      totalSavings: report.totalSavings,
      totalSpent: report.totalSpent,
    });

    return report;
  } catch (error) {
    console.error("Error running manual monthly report:", error);
    throw error;
  }
}

module.exports = {
  startCronJobs,
  stopCronJobs,
  runManualMonthlyReport,
  monthlyReportCron,
  emailCleanupCron,
};
