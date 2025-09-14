const mongoose = require("mongoose");
const Task = require("../models/Task");
require("dotenv").config();

// Kết nối MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Reset tất cả tasks về trạng thái chưa hoàn thành
async function resetAllTasks() {
  try {
    console.log("Starting task reset process...");

    // Đếm số tasks hiện tại
    const totalTasks = await Task.countDocuments();
    console.log(`Total tasks in system: ${totalTasks}`);

    // Đếm số tasks đã hoàn thành
    const completedTasks = await Task.countDocuments({ completed: true });
    console.log(`Completed tasks: ${completedTasks}`);

    if (completedTasks === 0) {
      console.log("No completed tasks found. Nothing to reset.");
      return;
    }

    // Reset tất cả tasks về trạng thái chưa hoàn thành
    const result = await Task.updateMany(
      {}, // Không có điều kiện, update tất cả tasks
      {
        completed: false,
        completedAt: null
      }
    );

    console.log(`✅ Task reset completed successfully!`);
    console.log(`📊 Tasks modified: ${result.modifiedCount}`);
    console.log(`📅 Reset timestamp: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`);

    // Verify reset
    const remainingCompletedTasks = await Task.countDocuments({ completed: true });
    console.log(`🔍 Verification: Completed tasks after reset: ${remainingCompletedTasks}`);

    if (remainingCompletedTasks === 0) {
      console.log("✨ All tasks successfully reset to incomplete status!");
    } else {
      console.log("⚠️ Warning: Some tasks may not have been reset properly.");
    }

  } catch (error) {
    console.error("❌ Error during task reset:", error);
    throw error;
  }
}

// Main function
async function main() {
  console.log("=".repeat(50));
  console.log("🔄 WEEKLY TASK RESET SCRIPT");
  console.log("=".repeat(50));
  console.log(`⏰ Execution time: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`);
  console.log("");

  try {
    // Kết nối database
    await connectDB();

    // Reset tasks
    await resetAllTasks();

    console.log("");
    console.log("✅ Script completed successfully!");

  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  } finally {
    // Đóng kết nối database
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  main();
}

module.exports = {
  resetAllTasks,
  connectDB
};
