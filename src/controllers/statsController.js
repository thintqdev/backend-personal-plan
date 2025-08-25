const Task = require("../models/Task");
const User = require("../models/User");

// GET /api/stats - Lấy thống kê tổng quan
exports.getGeneralStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });

    // Get user streak (giả sử chỉ có 1 user)
    const user = await User.findOne();
    const currentStreak = user ? user.streak : 0;

    // Tính today progress
    const today = new Date();
    const dayNames = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const todayName = dayNames[today.getDay()];

    const todayTasks = await Task.find({ day: todayName });
    const todayCompletedTasks = await Task.find({
      day: todayName,
      completed: true,
    });
    const todayProgress = `${todayCompletedTasks.length}/${todayTasks.length}`;

    // Tính week progress (giả sử tính theo tỷ lệ %)
    const weekProgress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      todayProgress,
      weekProgress,
      currentStreak,
      totalTasks,
      completedTasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/stats/today - Thống kê hôm nay
exports.getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    const dayNames = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const todayName = dayNames[today.getDay()];

    const todayTasks = await Task.find({ day: todayName });
    const todayCompletedTasks = await Task.find({
      day: todayName,
      completed: true,
    });
    const todayProgress = `${todayCompletedTasks.length}/${todayTasks.length}`;

    res.json({
      todayProgress,
      totalTasks: todayTasks.length,
      completedTasks: todayCompletedTasks.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/stats/week - Thống kê tuần
exports.getWeekStats = async (req, res) => {
  try {
    // Lấy các ngày trong tuần
    const weekDays = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Sáu",
      "Chủ Nhật",
    ];

    const weekTasks = await Task.find({ day: { $in: weekDays } });
    const weekCompletedTasks = await Task.find({
      day: { $in: weekDays },
      completed: true,
    });

    const weekProgress =
      weekTasks.length > 0
        ? Math.round((weekCompletedTasks.length / weekTasks.length) * 100)
        : 0;

    res.json({
      weekProgress,
      totalTasks: weekTasks.length,
      completedTasks: weekCompletedTasks.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
