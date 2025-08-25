const mongoose = require("mongoose");
const Task = require("../models/Task");
require("dotenv").config();

const tasks = [
  // Thứ Hai
  {
    day: "Thứ Hai",
    time: "06:30 – 07:30",
    description: "Thói quen buổi sáng + Podcast 🇯🇵",
    type: "Học tập",
  },
  {
    day: "Thứ Hai",
    time: "08:00 – 18:00",
    description: "Làm việc (tập trung 3 nhiệm vụ chính)",
    type: "Công việc",
  },
  {
    day: "Thứ Hai",
    time: "18:15 – 19:30",
    description: "Gym (Ngực & Tay) 💪",
    type: "Thể dục",
  },
  {
    day: "Thứ Hai",
    time: "20:00 – 21:30",
    description: "Học tiếng Nhật (20 từ mới + kanji) 📚",
    type: "Học tập",
  },
  {
    day: "Thứ Hai",
    time: "21:30 – 22:00",
    description: "Viết nhật ký + tổng kết ✍️",
    type: "Thư giãn",
  },
  {
    day: "Thứ Hai",
    time: "22:00 – 23:00",
    description: "Đọc sách / Nghe nhạc 🎶",
    type: "Thư giãn",
  },
  // Thứ Ba
  {
    day: "Thứ Ba",
    time: "06:30 – 07:30",
    description: "Flashcards (10 từ mới) 🇯🇵",
    type: "Học tập",
  },
  {
    day: "Thứ Ba",
    time: "08:00 – 18:00",
    description: "Làm việc",
    type: "Công việc",
  },
  {
    day: "Thứ Ba",
    time: "18:00 – 20:00",
    description: "Lớp tiếng Nhật tại trung tâm 🇯🇵",
    type: "Học tập",
  },
  {
    day: "Thứ Ba",
    time: "20:30 – 21:30",
    description: "Ôn bài + nghe NHK Easy",
    type: "Học tập",
  },
  {
    day: "Thứ Ba",
    time: "21:30 – 22:30",
    description: "Thư giãn (đi bộ, cafe, xem phim) 🎬",
    type: "Thư giãn",
  },
  {
    day: "Thứ Ba",
    time: "22:30 – 23:00",
    description: "Tổng kết ngày",
    type: "Thư giãn",
  },
  // Thứ Tư
  {
    day: "Thứ Tư",
    time: "06:30 – 07:30",
    description: "Chạy bộ + Ăn sáng 🏃",
    type: "Thể dục",
  },
  {
    day: "Thứ Tư",
    time: "08:00 – 18:00",
    description: "Làm việc",
    type: "Công việc",
  },
  {
    day: "Thứ Tư",
    time: "18:15 – 19:30",
    description: "Gym (Lưng & Xô) 💪",
    type: "Thể dục",
  },
  {
    day: "Thứ Tư",
    time: "20:00 – 21:30",
    description: "Dự án cá nhân (Blog/Code DichoViet) 👨‍💻",
    type: "Công việc",
  },
  {
    day: "Thứ Tư",
    time: "21:30 – 22:30",
    description: "Đọc sách tài chính 📖",
    type: "Học tập",
  },
  {
    day: "Thứ Tư",
    time: "22:30 – 23:00",
    description: "Ghi chú tài chính + nhật ký",
    type: "Học tập",
  },
  // Thứ Năm
  {
    day: "Thứ Năm",
    time: "06:30 – 07:30",
    description: "Luyện ngữ pháp + dịch 🇯🇵",
    type: "Học tập",
  },
  {
    day: "Thứ Năm",
    time: "08:00 – 18:00",
    description: "Làm việc",
    type: "Công việc",
  },
  {
    day: "Thứ Năm",
    time: "18:00 – 20:00",
    description: "Lớp tiếng Nhật tại trung tâm 🇯🇵",
    type: "Học tập",
  },
  {
    day: "Thứ Năm",
    time: "20:30 – 21:30",
    description: "Ôn tập + luyện JLPT (10 câu)",
    type: "Học tập",
  },
  {
    day: "Thứ Năm",
    time: "21:30 – 22:30",
    description: "Game / Xem phim 🎮",
    type: "Thư giãn",
  },
  {
    day: "Thứ Năm",
    time: "22:30 – 23:00",
    description: "Chuẩn bị cho ngày mai",
    type: "Thư giãn",
  },
  // Thứ Sáu
  {
    day: "Thứ Sáu",
    time: "06:30 – 07:30",
    description: "Thiền + Ăn sáng 🧘",
    type: "Thư giãn",
  },
  {
    day: "Thứ Sáu",
    time: "08:00 – 18:00",
    description: "Làm việc",
    type: "Công việc",
  },
  {
    day: "Thứ Sáu",
    time: "18:15 – 19:30",
    description: "Gym (Chân & Vai) 💪",
    type: "Thể dục",
  },
  {
    day: "Thứ Sáu",
    time: "20:00 – 22:00",
    description: "Gặp bạn, cafe, xem phim 🎉",
    type: "Giao lưu",
  },
  {
    day: "Thứ Sáu",
    time: "22:00 – 23:00",
    description: "Tổng kết công việc tuần",
    type: "Công việc",
  },
  // Thứ Bảy
  {
    day: "Thứ Bảy",
    time: "07:30 – 08:30",
    description: "Tập nhẹ + Ăn sáng",
    type: "Thể dục",
  },
  {
    day: "Thứ Bảy",
    time: "09:00 – 11:00",
    description: "Thi thử JLPT (Đọc/Nghe) 🇯🇵",
    type: "Học tập",
  },
  {
    day: "Thứ Bảy",
    time: "13:00 – 16:00",
    description: "Dự án cá nhân (Blog/Code) 👨‍💻",
    type: "Công việc",
  },
  {
    day: "Thứ Bảy",
    time: "16:00 – 18:00",
    description: "Cafe học nhóm ☕",
    type: "Giao lưu",
  },
  {
    day: "Thứ Bảy",
    time: "19:00 – 22:00",
    description: "Bạn bè / Giải trí 🎬",
    type: "Giao lưu",
  },
  {
    day: "Thứ Bảy",
    time: "22:30 – 23:00",
    description: "Viết nhật ký",
    type: "Thư giãn",
  },
  // Chủ Nhật
  {
    day: "Chủ Nhật",
    time: "07:30 – 09:30",
    description: "Coding Challenge / IT Skill 📊",
    type: "Học tập",
  },
  {
    day: "Chủ Nhật",
    time: "10:00 – 12:00",
    description: "Tiếng Nhật (Kanji + Nghe) 🇯🇵",
    type: "Học tập",
  },
  {
    day: "Chủ Nhật",
    time: "14:00 – 16:00",
    description: "Tổng kết tuần + Lên kế hoạch tuần mới 📝",
    type: "Công việc",
  },
  {
    day: "Chủ Nhật",
    time: "16:00 – 18:00",
    description: "Đi dạo / Giao lưu",
    type: "Giao lưu",
  },
  {
    day: "Chủ Nhật",
    time: "19:00 – 21:00",
    description: "Đọc sách (Phát triển bản thân/Tài chính) 📖",
    type: "Học tập",
  },
  {
    day: "Chủ Nhật",
    time: "21:00 – 22:00",
    description: "Thư giãn (nghe nhạc, thiền) 🎶",
    type: "Thư giãn",
  },
  {
    day: "Chủ Nhật",
    time: "22:00 – 23:00",
    description: "Chuẩn bị cho Thứ Hai",
    type: "Thư giãn",
  },
];

async function seedTasks() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Task.deleteMany({});
  await Task.insertMany(tasks);
  console.log("Tasks seeded!");
  await mongoose.disconnect();
}

seedTasks();
