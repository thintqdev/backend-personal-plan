const User = require("../models/User");

// Lấy thông tin cá nhân (authenticated user)
exports.getUser = async (req, res) => {
  try {
    // Get current authenticated user or find any user for backward compatibility
    let user;
    if (req.user && req.user.id) {
      user = await User.findById(req.user.id);
    } else {
      // Fallback for backward compatibility - get the first user
      user = await User.findOne();
    }
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật thông tin cá nhân (authenticated user)
exports.updateUser = async (req, res) => {
  try {
    const { name, role, goal, streak, avatar, income } = req.body;
    
    let user;
    if (req.user && req.user.id) {
      // Update authenticated user
      user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
    } else {
      // Fallback for backward compatibility
      user = await User.findOne();
      if (!user) {
        // Create new user only if authenticated or no users exist
        user = new User({ name, role, goal, streak, avatar, income });
      }
    }
    
    // Update user fields
    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (goal !== undefined) user.goal = goal;
    if (streak !== undefined) user.streak = streak;
    if (avatar !== undefined) user.avatar = avatar;
    if (income !== undefined) user.income = income;
    
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/user/preferences - Lấy preferences (authenticated user)
exports.getUserPreferences = async (req, res) => {
  try {
    let user;
    if (req.user && req.user.id) {
      user = await User.findById(req.user.id);
    } else {
      // Fallback for backward compatibility
      user = await User.findOne();
    }
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/user/preferences - Cập nhật preferences (authenticated user)
exports.updateUserPreferences = async (req, res) => {
  try {
    const { theme, coverImage, notifications, language } = req.body;

    let user;
    if (req.user && req.user.id) {
      user = await User.findById(req.user.id);
    } else {
      // Fallback for backward compatibility
      user = await User.findOne();
    }
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update preferences
    user.preferences = {
      theme: theme || user.preferences.theme,
      coverImage: coverImage !== undefined ? coverImage : user.preferences.coverImage,
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

// PUT /api/user/income - Cập nhật thu nhập (authenticated user)
exports.updateUserIncome = async (req, res) => {
  try {
    const { income } = req.body;

    if (income === undefined || income < 0) {
      return res
        .status(400)
        .json({ error: "Income must be a non-negative number" });
    }

    let user;
    if (req.user && req.user.id) {
      user = await User.findById(req.user.id);
    } else {
      // Fallback for backward compatibility
      user = await User.findOne();
    }
    
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
