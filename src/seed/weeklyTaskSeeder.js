const mongoose = require("mongoose");
const Task = require("../models/Task");
require("dotenv").config();

const weeklyTasks = [
  // Thứ Hai
  {
    day: "Thứ Hai",
    type: "Study",
    time: "06:30 - 07:30",
    task: "Thói quen buổi sáng + Podcast 🇯🇵",
    completed: false,
  },
  {
    day: "Thứ Hai",
    type: "Work",
    time: "08:00 - 12:00",
    task: "Làm việc frontend",
    completed: false,
  },
  {
    day: "Thứ Hai",
    type: "Study",
    time: "14:00 - 16:00",
    task: "Học tiếng Nhật",
    completed: true,
  },

  // Thứ Ba
  {
    day: "Thứ Ba",
    type: "Gym",
    time: "06:00 - 07:00",
    task: "Tập gym buổi sáng",
    completed: false,
  },
  {
    day: "Thứ Ba",
    type: "Work",
    time: "09:00 - 17:00",
    task: "Phát triển API backend",
    completed: false,
  },
  {
    day: "Thứ Ba",
    type: "Study",
    time: "19:00 - 20:00",
    task: "Đọc sách công nghệ",
    completed: false,
  },

  // Thứ Tư
  {
    day: "Thứ Tư",
    type: "Study",
    time: "06:30 - 07:30",
    task: "Học algorithm",
    completed: false,
  },
  {
    day: "Thứ Tư",
    type: "Work",
    time: "08:00 - 17:00",
    task: "Code review và fix bugs",
    completed: false,
  },

  // Thứ Năm
  {
    day: "Thứ Năm",
    type: "Gym",
    time: "06:00 - 07:00",
    task: "Cardio workout",
    completed: false,
  },
  {
    day: "Thứ Năm",
    type: "Work",
    time: "09:00 - 18:00",
    task: "Meeting và planning",
    completed: false,
  },

  // Thứ Sáu
  {
    day: "Thứ Sáu",
    type: "Work",
    time: "08:00 - 17:00",
    task: "Hoàn thiện dự án",
    completed: false,
  },
  {
    day: "Thứ Sáu",
    type: "Personal",
    time: "19:00 - 21:00",
    task: "Thời gian cho gia đình",
    completed: false,
  },

  // Thứ Bảy
  {
    day: "Thứ Bảy",
    type: "Personal",
    time: "09:00 - 10:00",
    task: "Dọn dẹp nhà cửa",
    completed: false,
  },
  {
    day: "Thứ Bảy",
    type: "Study",
    time: "14:00 - 16:00",
    task: "Side project development",
    completed: false,
  },

  // Chủ Nhật
  {
    day: "Chủ Nhật",
    type: "Personal",
    time: "08:00 - 09:00",
    task: "Tập thể dục ngoài trời",
    completed: false,
  },
  {
    day: "Chủ Nhật",
    type: "Personal",
    time: "10:00 - 12:00",
    task: "Thời gian thư giãn",
    completed: false,
  },
];

async function seedWeeklyTasks() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear existing tasks
  await Task.deleteMany({});

  // Insert weekly tasks
  for (const taskData of weeklyTasks) {
    const task = new Task(taskData);
    if (task.completed) {
      task.completedAt = new Date();
    }
    await task.save();
  }

  console.log("Weekly tasks seeded successfully!");
  await mongoose.disconnect();
}

seedWeeklyTasks().catch(console.error);
