const Goal = require("../models/Goal");

// GET /api/goals - Lấy tất cả goals
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/goals/:id - Lấy goal theo ID
exports.getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/goals - Tạo goal mới
exports.createGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      status,
      targetDate,
      subGoals,
    } = req.body;

    const goalData = {
      title,
      description,
      category,
      priority,
      status: status || "Not Started",
    };

    if (targetDate) {
      goalData.targetDate = new Date(targetDate);
    }

    if (subGoals && Array.isArray(subGoals)) {
      goalData.subGoals = subGoals.map((subGoal) => ({
        ...subGoal,
        targetDate: subGoal.targetDate
          ? new Date(subGoal.targetDate)
          : undefined,
        completedAt: subGoal.completedAt
          ? new Date(subGoal.completedAt)
          : undefined,
      }));
    }

    const newGoal = new Goal(goalData);
    await newGoal.save();

    res.status(201).json(newGoal);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/goals/:id - Cập nhật goal
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      priority,
      status,
      targetDate,
      subGoals,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (targetDate !== undefined) {
      updateData.targetDate = targetDate ? new Date(targetDate) : null;
    }
    if (subGoals !== undefined) {
      updateData.subGoals = Array.isArray(subGoals)
        ? subGoals.map((subGoal) => ({
            ...subGoal,
            targetDate: subGoal.targetDate
              ? new Date(subGoal.targetDate)
              : undefined,
            completedAt: subGoal.completedAt
              ? new Date(subGoal.completedAt)
              : undefined,
          }))
        : [];
    }

    const updatedGoal = await Goal.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json(updatedGoal);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/goals/:id - Xóa goal
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGoal = await Goal.findByIdAndDelete(id);

    if (!deletedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully", goal: deletedGoal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/goals/filter?status=In Progress&priority=High
exports.getGoalsByFilter = async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/goals/stats - Thống kê goals
exports.getGoalStats = async (req, res) => {
  try {
    const totalGoals = await Goal.countDocuments();
    const completedGoals = await Goal.countDocuments({ status: "Completed" });
    const inProgressGoals = await Goal.countDocuments({
      status: "In Progress",
    });
    const notStartedGoals = await Goal.countDocuments({
      status: "Not Started",
    });
    const onHoldGoals = await Goal.countDocuments({ status: "On Hold" });

    const priorityStats = await Goal.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // SubGoals statistics
    const goalsWithSubGoals = await Goal.find({
      subGoals: { $exists: true, $ne: [] },
    });
    let totalSubGoals = 0;
    let completedSubGoals = 0;

    goalsWithSubGoals.forEach((goal) => {
      if (goal.subGoals) {
        totalSubGoals += goal.subGoals.length;
        completedSubGoals += goal.subGoals.filter(
          (sub) => sub.status === "Completed"
        ).length;
      }
    });

    const completionRate =
      totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const subGoalCompletionRate =
      totalSubGoals > 0
        ? Math.round((completedSubGoals / totalSubGoals) * 100)
        : 0;

    res.json({
      totalGoals,
      completedGoals,
      inProgressGoals,
      notStartedGoals,
      onHoldGoals,
      completionRate,
      totalSubGoals,
      completedSubGoals,
      subGoalCompletionRate,
      priorityBreakdown: priorityStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/goals/:id/subgoals - Thêm subgoal vào goal
exports.addSubGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, targetDate } = req.body;

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const newSubGoal = {
      title,
      description,
      status: status || "Not Started",
      targetDate: targetDate ? new Date(targetDate) : undefined,
    };

    goal.subGoals.push(newSubGoal);
    await goal.save();

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/goals/:goalId/subgoals/:subgoalId - Cập nhật subgoal
exports.updateSubGoal = async (req, res) => {
  try {
    const { goalId, subgoalId } = req.params;
    const { title, description, status, targetDate, completedAt } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const subGoal = goal.subGoals.id(subgoalId);
    if (!subGoal) {
      return res.status(404).json({ error: "SubGoal not found" });
    }

    if (title !== undefined) subGoal.title = title;
    if (description !== undefined) subGoal.description = description;
    if (status !== undefined) {
      subGoal.status = status;
      if (status === "Completed" && !subGoal.completedAt) {
        subGoal.completedAt = new Date();
      } else if (status !== "Completed") {
        subGoal.completedAt = undefined;
      }
    }
    if (targetDate !== undefined) {
      subGoal.targetDate = targetDate ? new Date(targetDate) : undefined;
    }
    if (completedAt !== undefined) {
      subGoal.completedAt = completedAt ? new Date(completedAt) : undefined;
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/goals/:goalId/subgoals/:subgoalId - Xóa subgoal
exports.deleteSubGoal = async (req, res) => {
  try {
    const { goalId, subgoalId } = req.params;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const subGoal = goal.subGoals.id(subgoalId);
    if (!subGoal) {
      return res.status(404).json({ error: "SubGoal not found" });
    }

    goal.subGoals.pull(subgoalId);
    await goal.save();

    res.json({ message: "SubGoal deleted successfully", goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
