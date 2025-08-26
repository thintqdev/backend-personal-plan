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
    subGoals: [
      {
        title: "Hoàn thành React Hooks Course",
        description:
          "Học xong tất cả hooks: useState, useEffect, useContext, useReducer",
        status: "Completed",
        targetDate: new Date("2025-09-15"),
        completedAt: new Date("2025-08-20"),
      },
      {
        title: "Xây dựng Todo App với React",
        description: "Tạo một ứng dụng Todo hoàn chỉnh với CRUD operations",
        status: "In Progress",
        targetDate: new Date("2025-09-30"),
      },
      {
        title: "Học Next.js fundamentals",
        description: "Nắm vững routing, SSR, SSG trong Next.js",
        status: "Not Started",
        targetDate: new Date("2025-11-15"),
      },
      {
        title: "Deploy dự án lên Vercel",
        description: "Triển khai ứng dụng Next.js lên production",
        status: "Not Started",
        targetDate: new Date("2025-12-15"),
      },
    ],
  },
  {
    title: "Tập gym đều đặn",
    description: "Tập gym 4 lần/tuần để cải thiện sức khỏe và xây dựng cơ bắp",
    category: "Health & Fitness",
    priority: "Medium",
    status: "In Progress",
    targetDate: new Date("2025-10-31"),
    subGoals: [
      {
        title: "Tập gym 3 lần trong tuần đầu",
        description: "Bắt đầu với 3 lần/tuần để quen với việc tập luyện",
        status: "Completed",
        completedAt: new Date("2025-08-10"),
      },
      {
        title: "Tăng lên 4 lần/tuần",
        description: "Tăng tần suất tập luyện lên 4 lần/tuần",
        status: "In Progress",
        targetDate: new Date("2025-09-01"),
      },
      {
        title: "Đạt mục tiêu cân nặng 70kg",
        description: "Tăng cân từ 65kg lên 70kg",
        status: "In Progress",
        targetDate: new Date("2025-10-31"),
      },
    ],
  },
  {
    title: "Đọc 24 quyển sách trong năm",
    description:
      "Đọc 2 quyển sách mỗi tháng, tập trung vào sách kỹ năng và phát triển bản thân",
    category: "Personal Development",
    priority: "Medium",
    status: "In Progress",
    subGoals: [
      {
        title: "Đọc 'Atomic Habits'",
        description: "Hoàn thành việc đọc sách về xây dựng thói quen",
        status: "Completed",
        completedAt: new Date("2025-08-15"),
      },
      {
        title: "Đọc 'The Power of Now'",
        description: "Học về mindfulness và sống trong hiện tại",
        status: "In Progress",
      },
      {
        title: "Đọc sách về JavaScript",
        description: "Cải thiện kỹ năng lập trình JavaScript",
        status: "Not Started",
        targetDate: new Date("2025-09-30"),
      },
    ],
  },
  {
    title: "Học tiếng Nhật N3",
    description: "Đạt chứng chỉ JLPT N3 để có thể đọc hiểu và giao tiếp cơ bản",
    category: "Language Learning",
    priority: "High",
    status: "Not Started",
    targetDate: new Date("2025-12-01"),
    subGoals: [
      {
        title: "Học xong Hiragana và Katakana",
        description: "Nắm vững 2 bảng chữ cái cơ bản của tiếng Nhật",
        status: "Not Started",
        targetDate: new Date("2025-09-15"),
      },
      {
        title: "Học 500 kanji cơ bản",
        description: "Thuộc nghĩa và cách đọc 500 ký tự kanji",
        status: "Not Started",
        targetDate: new Date("2025-10-31"),
      },
      {
        title: "Luyện nghe 30 phút/ngày",
        description: "Cải thiện khả năng nghe hiểu tiếng Nhật",
        status: "Not Started",
        targetDate: new Date("2025-11-30"),
      },
    ],
  },
  {
    title: "Xây dựng startup side project",
    description:
      "Phát triển một ứng dụng web có thể kiếm tiền từ 100 users đầu tiên",
    category: "Business",
    priority: "High",
    status: "Not Started",
    targetDate: new Date("2026-03-31"),
    subGoals: [
      {
        title: "Research và validate ý tưởng",
        description: "Tìm hiểu thị trường và xác thực ý tưởng kinh doanh",
        status: "Not Started",
        targetDate: new Date("2025-10-15"),
      },
      {
        title: "Xây dựng MVP",
        description: "Tạo phiên bản sản phẩm tối thiểu khả thi",
        status: "Not Started",
        targetDate: new Date("2025-12-31"),
      },
      {
        title: "Tìm 10 users đầu tiên",
        description: "Thu hút 10 người dùng đầu tiên để test sản phẩm",
        status: "Not Started",
        targetDate: new Date("2026-02-15"),
      },
    ],
  },
  {
    title: "Du lịch Nhật Bản",
    description:
      "Lên kế hoạch và thực hiện chuyến du lịch 10 ngày tại Nhật Bản",
    category: "Travel",
    priority: "Low",
    status: "On Hold",
    targetDate: new Date("2025-11-15"),
    subGoals: [
      {
        title: "Tiết kiệm 30 triệu cho chuyến đi",
        description: "Dành dụm tiền cho chi phí du lịch",
        status: "In Progress",
        targetDate: new Date("2025-10-01"),
      },
      {
        title: "Xin visa du lịch",
        description: "Hoàn thành thủ tục xin visa Nhật Bản",
        status: "Not Started",
        targetDate: new Date("2025-10-15"),
      },
    ],
  },
];

async function seedGoals() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear existing goals
  await Goal.deleteMany({});

  // Insert sample goals with subgoals
  for (const goalData of sampleGoals) {
    const goal = new Goal(goalData);
    await goal.save();
  }

  console.log("Goals with SubGoals seeded successfully!");
  console.log(`Inserted ${sampleGoals.length} goals`);

  // Count total subgoals
  const totalSubGoals = sampleGoals.reduce((acc, goal) => {
    return acc + (goal.subGoals ? goal.subGoals.length : 0);
  }, 0);
  console.log(`Inserted ${totalSubGoals} subgoals`);

  await mongoose.disconnect();
}

seedGoals().catch(console.error);
