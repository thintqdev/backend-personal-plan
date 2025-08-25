const Task = require("../models/Task");

// Lấy danh sách công việc theo thứ trong tuần
exports.getTasks = async (req, res) => {
  try {
    const { day } = req.query;

    if (!day) {
      const tasks = await Task.find();
      return res.json({
        tasks: tasks.map((task) => ({
          _id: task._id,
          time: task.time,
          task: task.task,
          type: task.type,
          completed: task.completed,
        })),
      });
    }

    const tasks = await Task.find({ day });

    // Trả về format theo yêu cầu FE
    const response = {
      day: day,
      tasks: tasks.map((task) => ({
        _id: task._id,
        time: task.time,
        task: task.task,
        type: task.type,
        completed: task.completed,
      })),
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
    const newTask = new Task({ day, type, time, task });
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
    const { day, type, time, task } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { day, type, time, task },
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ error: "Task not found" });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá công việc
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ error: "Task not found" });
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

    const updateData = { completed };
    if (completed) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
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
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
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
