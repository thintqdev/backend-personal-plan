const mongoose = require("mongoose");
const Goal = require("../models/Goal");
require("dotenv").config();

const sampleGoals = [
  {
    title: "Học Master React & Next.js",
    description:
      "Hoàn thành khóa học React advanced và xây dựng 3 dự án thực tế với Next.js",
    category: "Programming",
    priority: "High",
    status: "In Progress",
    targetDate: new Date("2025-12-31"),
  },
  {
    title: "Tập gym đều đặn",
    description: "Tập gym 4 lần/tuần để cải thiện sức khỏe và xây dựng cơ bắp",
    category: "Health & Fitness",
    priority: "Medium",
    status: "In Progress",
    targetDate: new Date("2025-10-31"),
  },
  {
    title: "Đọc 24 quyển sách trong năm",
    description:
      "Đọc 2 quyển sách mỗi tháng, tập trung vào sách kỹ năng và phát triển bản thân",
    category: "Personal Development",
    priority: "Medium",
    status: "In Progress",
  },
  {
    title: "Học tiếng Nhật N3",
    description: "Đạt chứng chỉ JLPT N3 để có thể đọc hiểu và giao tiếp cơ bản",
    category: "Language Learning",
    priority: "High",
    status: "Not Started",
    targetDate: new Date("2025-12-01"),
  },
  {
    title: "Xây dựng startup side project",
    description:
      "Phát triển một ứng dụng web có thể kiếm tiền từ 100 users đầu tiên",
    category: "Business",
    priority: "High",
    status: "Not Started",
    targetDate: new Date("2026-03-31"),
  },
  {
    title: "Du lịch Nhật Bản",
    description:
      "Lên kế hoạch và thực hiện chuyến du lịch 10 ngày tại Nhật Bản",
    category: "Travel",
    priority: "Low",
    status: "On Hold",
    targetDate: new Date("2025-11-15"),
  },
  {
    title: "Hoàn thành khóa học AI/ML",
    description:
      "Học xong course Machine Learning và áp dụng vào dự án thực tế",
    category: "Programming",
    priority: "Medium",
    status: "Not Started",
    targetDate: new Date("2025-09-30"),
  },
  {
    title: "Tiết kiệm 50 triệu VND",
    description:
      "Tiết kiệm đều đặn mỗi tháng để đạt mục tiêu 50 triệu VND cuối năm",
    category: "Finance",
    priority: "High",
    status: "In Progress",
    targetDate: new Date("2025-12-31"),
  },
  {
    title: "Học nấu ăn cơ bản",
    description: "Học nấu 20 món ăn Việt Nam và quốc tế cơ bản",
    category: "Life Skills",
    priority: "Low",
    status: "Completed",
  },
  {
    title: "Xây dựng thói quen meditation",
    description:
      "Thiền định 15 phút mỗi ngày để cải thiện tập trung và giảm stress",
    category: "Mental Health",
    priority: "Medium",
    status: "In Progress",
  },
];

async function seedGoals() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear existing goals
  await Goal.deleteMany({});

  // Insert sample goals
  for (const goalData of sampleGoals) {
    const goal = new Goal(goalData);
    await goal.save();
  }

  console.log("Goals seeded successfully!");
  console.log(`Inserted ${sampleGoals.length} goals`);
  await mongoose.disconnect();
}

seedGoals().catch(console.error);
