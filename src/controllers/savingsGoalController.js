const SavingsGoal = require('../models/SavingsGoal');

// Get all savings goals for a user
const getSavingsGoals = async (req, res) => {
    try {
        const userId = req.user?.id || '66f4b8c123456789abcdef01'; // Mock user ID for development

        const goals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 });

        // Calculate current amounts from transactions
        goals.forEach(goal => {
            goal.calculateCurrentAmount();
        });

        res.json({
            success: true,
            data: goals
        });
    } catch (error) {
        console.error('Error fetching savings goals:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách mục tiêu tiết kiệm',
            error: error.message
        });
    }
};

// Create a new savings goal
const createSavingsGoal = async (req, res) => {
    try {
        const userId = req.user?.id || '66f4b8c123456789abcdef01'; // Mock user ID for development

        const {
            name,
            description,
            targetAmount,
            deadline,
            category,
            color,
            icon,
            priority
        } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Tên mục tiêu không được để trống'
            });
        }

        if (!targetAmount || targetAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền mục tiêu phải lớn hơn 0'
            });
        }

        if (targetAmount > 1000000000000) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền mục tiêu quá lớn'
            });
        }

        if (deadline) {
            const deadlineDate = new Date(deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (deadlineDate < today) {
                return res.status(400).json({
                    success: false,
                    message: 'Hạn hoàn thành không thể là ngày trong quá khứ'
                });
            }
        }

        const goal = new SavingsGoal({
            name: name.trim(),
            description: description || '',
            targetAmount,
            deadline: deadline ? new Date(deadline) : null,
            category: category || 'Tiết kiệm',
            color: color || '#3B82F6',
            icon: icon || '💰',
            priority: priority || 'Medium',
            userId
        });

        await goal.save();

        res.status(201).json({
            success: true,
            data: goal,
            message: 'Tạo mục tiêu tiết kiệm thành công'
        });
    } catch (error) {
        console.error('Error creating savings goal:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo mục tiêu tiết kiệm',
            error: error.message
        });
    }
};

// Update a savings goal
const updateSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || '66f4b8c123456789abcdef01'; // Mock user ID for development

        const goal = await SavingsGoal.findOne({ _id: id, userId });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục tiêu tiết kiệm'
            });
        }

        const {
            name,
            description,
            targetAmount,
            deadline,
            category,
            color,
            icon,
            priority,
            isActive
        } = req.body;

        // Validation for updated fields
        if (name !== undefined) {
            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên mục tiêu không được để trống'
                });
            }
            goal.name = name.trim();
        }

        if (targetAmount !== undefined) {
            if (targetAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền mục tiêu phải lớn hơn 0'
                });
            }
            if (targetAmount > 1000000000000) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền mục tiêu quá lớn'
                });
            }
            goal.targetAmount = targetAmount;
        }

        if (deadline !== undefined) {
            if (deadline) {
                const deadlineDate = new Date(deadline);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (deadlineDate < today) {
                    return res.status(400).json({
                        success: false,
                        message: 'Hạn hoàn thành không thể là ngày trong quá khứ'
                    });
                }
                goal.deadline = deadlineDate;
            } else {
                goal.deadline = null;
            }
        }

        if (description !== undefined) goal.description = description;
        if (category !== undefined) goal.category = category;
        if (color !== undefined) goal.color = color;
        if (icon !== undefined) goal.icon = icon;
        if (priority !== undefined) goal.priority = priority;
        if (isActive !== undefined) goal.isActive = isActive;

        await goal.save();

        res.json({
            success: true,
            data: goal,
            message: 'Cập nhật mục tiêu tiết kiệm thành công'
        });
    } catch (error) {
        console.error('Error updating savings goal:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật mục tiêu tiết kiệm',
            error: error.message
        });
    }
};

// Delete a savings goal
const deleteSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || '66f4b8c123456789abcdef01'; // Mock user ID for development

        const goal = await SavingsGoal.findOne({ _id: id, userId });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục tiêu tiết kiệm'
            });
        }

        await SavingsGoal.deleteOne({ _id: id, userId });

        res.json({
            success: true,
            message: 'Xóa mục tiêu tiết kiệm thành công'
        });
    } catch (error) {
        console.error('Error deleting savings goal:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa mục tiêu tiết kiệm',
            error: error.message
        });
    }
};

// Add money to a savings goal
const addMoneyToGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description } = req.body;
        const userId = req.user?.id || '66f4b8c123456789abcdef01'; // Mock user ID for development

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền phải lớn hơn 0'
            });
        }

        const goal = await SavingsGoal.findOne({ _id: id, userId });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục tiêu tiết kiệm'
            });
        }

        await goal.addMoney(amount, description || '');

        res.json({
            success: true,
            data: goal,
            message: 'Thêm tiền thành công'
        });
    } catch (error) {
        console.error('Error adding money to goal:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm tiền vào mục tiêu tiết kiệm',
            error: error.message
        });
    }
};

// Withdraw money from a savings goal
const withdrawMoneyFromGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description } = req.body;
        const userId = req.user?.id || '66f4b8c123456789abcdef01'; // Mock user ID for development

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền phải lớn hơn 0'
            });
        }

        const goal = await SavingsGoal.findOne({ _id: id, userId });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục tiêu tiết kiệm'
            });
        }

        goal.calculateCurrentAmount();

        if (amount > goal.currentAmount) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền rút không thể lớn hơn số dư hiện tại'
            });
        }

        await goal.withdrawMoney(amount, description || '');

        res.json({
            success: true,
            data: goal,
            message: 'Rút tiền thành công'
        });
    } catch (error) {
        console.error('Error withdrawing money from goal:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi rút tiền từ mục tiêu tiết kiệm',
            error: error.message
        });
    }
};

// Get transactions for a savings goal
const getSavingsGoalTransactions = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || '66f4b8c123456789abcdef01'; // Mock user ID for development

        const goal = await SavingsGoal.findOne({ _id: id, userId });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục tiêu tiết kiệm'
            });
        }

        // Sort transactions by date (newest first)
        const transactions = goal.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching savings goal transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử giao dịch',
            error: error.message
        });
    }
};

module.exports = {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addMoneyToGoal,
    withdrawMoneyFromGoal,
    getSavingsGoalTransactions
};
