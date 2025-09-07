const Task = require("../models/Task");

// Lấy danh sách công việc theo thứ trong tuần
exports.getTasks = async (req, res) => {
  try {
    const { day } = req.query;
    const userId = req.user._id;

    if (!day) {
      const tasks = await Task.find({ userId });
      return res.json(tasks);
    }

    const tasks = await Task.find({ userId, day });

    // Trả về format theo yêu cầu FE
    const response = {
      day: day,
      tasks: tasks,
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm công việc mới
exports.createTask = async (req, res) => {
  try {
    const { day, type, time, task } = req.body;
    const userId = req.user._id;

    const newTask = new Task({ userId, day, type, time, task });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sửa công việc
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, type, time, task, completed } = req.body;
    const userId = req.user._id;

    const updateData = { day, type, time, task };
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ error: "Task not found or access denied" });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá công việc
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) return res.status(404).json({ error: "Task not found or access denied" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/tasks/{id}/complete - Toggle hoàn thành task
exports.toggleTaskComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const userId = req.user._id;

    const updateData = { completed };
    if (completed) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found or access denied" });
    }

    res.json({
      _id: task._id,
      completed: task.completed,
      completedAt: task.completedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tasks/{id}/status - Lấy trạng thái task
exports.getTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({ error: "Task not found or access denied" });
    }

    res.json({
      _id: task._id,
      completed: task.completed,
      completedAt: task.completedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tasks/weekly-stats - Lấy thống kê tasks trong tuần
exports.getWeeklyStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy tất cả tasks của user
    const allTasks = await Task.find({ userId });

    // Danh sách các thứ trong tuần
    const daysOfWeek = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ Nhật",
    ];

    // Tính toán thống kê cho từng ngày
    const dailyStats = daysOfWeek.map(day => {
      const dayTasks = allTasks.filter(task => task.day === day);
      const completedTasks = dayTasks.filter(task => task.completed);

      return {
        day,
        totalTasks: dayTasks.length,
        completedTasks: completedTasks.length,
        completionRate: dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0
      };
    });

    // Tính toán thống kê tổng quát cho tuần
    const totalWeeklyTasks = allTasks.length;
    const totalCompletedTasks = allTasks.filter(task => task.completed).length;
    const weeklyCompletionRate = totalWeeklyTasks > 0 ? Math.round((totalCompletedTasks / totalWeeklyTasks) * 100) : 0;

    // Tính streak (số ngày liên tiếp hoàn thành tất cả tasks)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (const dayStat of dailyStats) {
      if (dayStat.totalTasks > 0 && dayStat.completionRate === 100) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current streak tính từ cuối tuần về
    for (let i = dailyStats.length - 1; i >= 0; i--) {
      const dayStat = dailyStats[i];
      if (dayStat.totalTasks > 0 && dayStat.completionRate === 100) {
        currentStreak++;
      } else {
        break;
      }
    }

    const weeklyStats = {
      totalTasks: totalWeeklyTasks,
      completedTasks: totalCompletedTasks,
      completionRate: weeklyCompletionRate,
      currentStreak,
      longestStreak,
      dailyStats,
      summary: {
        bestDay: dailyStats.reduce((best, current) =>
          current.completionRate > best.completionRate ? current : best,
          dailyStats[0]
        ),
        activeDays: dailyStats.filter(day => day.totalTasks > 0).length,
        perfectDays: dailyStats.filter(day => day.completionRate === 100 && day.totalTasks > 0).length
      }
    };

    res.json(weeklyStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
