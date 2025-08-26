const cron = require("node-cron");
const { generateReport } = require("../controllers/monthlyReportController");
const User = require("../models/User");

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

// Cron job test - chạy mỗi phút (để test)
const testCron = cron.schedule(
  "*/1 * * * *", // Mỗi phút
  () => {
    console.log("Test cron job running at:", new Date().toISOString());
  },
  {
    scheduled: false,
    timezone: "Asia/Ho_Chi_Minh",
  }
);

// Khởi động các cron jobs
function startCronJobs() {
  console.log("Starting monthly report cron job...");
  monthlyReportCron.start();

  // Uncomment để test
  // console.log("Starting test cron job...");
  // testCron.start();
}

// Dừng các cron jobs
function stopCronJobs() {
  console.log("Stopping cron jobs...");
  monthlyReportCron.stop();
  testCron.stop();
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
  testCron,
};
