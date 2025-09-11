const User = require("../models/User");

// Lấy thông tin cá nhân
exports.getUser = async (req, res) => {
  try {
    // Sử dụng req.user từ middleware auth để lấy thông tin user chính xác
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Cập nhật thông tin cá nhân
exports.updateUser = async (req, res) => {
  try {
    const { name, role, goal, streak, avatar, income } = req.body;

    // Sử dụng req.user từ middleware auth để tìm user chính xác
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Cập nhật các trường
    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (goal !== undefined) user.goal = goal;
    if (streak !== undefined) user.streak = streak;
    if (avatar !== undefined) user.avatar = avatar;
    if (income !== undefined) user.income = income;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/user/preferences - Lấy preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/user/preferences - Cập nhật preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const { theme, coverImage, notifications, language } = req.body;

    let user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update preferences
    user.preferences = {
      theme: theme || user.preferences.theme,
      coverImage: coverImage || user.preferences.coverImage,
      notifications:
        notifications !== undefined
          ? notifications
          : user.preferences.notifications,
      language: language || user.preferences.language,
    };

    await user.save();
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/user/income - Cập nhật thu nhập
exports.updateUserIncome = async (req, res) => {
  try {
    const { income } = req.body;

    if (income === undefined || income < 0) {
      return res
        .status(400)
        .json({ error: "Income must be a non-negative number" });
    }

    let user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.income = income;
    await user.save();

    res.json({
      message: "Income updated successfully",
      income: user.income,
      user: user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    let user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Giả sử user chỉ có 1 tài khoản với mật khẩu đơn giản
    if (user.password !== oldPassword) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};