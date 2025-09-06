const mongoose = require('mongoose');

const savingsTransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['deposit', 'withdraw'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const savingsGoalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deadline: {
        type: Date,
        default: null
    },
    category: {
        type: String,
        required: true,
        default: 'Tiết kiệm'
    },
    color: {
        type: String,
        default: '#3B82F6'
    },
    icon: {
        type: String,
        default: '💰'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    transactions: [savingsTransactionSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Calculate current amount from transactions
savingsGoalSchema.methods.calculateCurrentAmount = function () {
    let amount = 0;
    this.transactions.forEach(transaction => {
        if (transaction.type === 'deposit') {
            amount += transaction.amount;
        } else if (transaction.type === 'withdraw') {
            amount -= transaction.amount;
        }
    });
    this.currentAmount = Math.max(0, amount);
    return this.currentAmount;
};

// Add money to goal
savingsGoalSchema.methods.addMoney = function (amount, description = '') {
    this.transactions.push({
        type: 'deposit',
        amount,
        description
    });
    this.calculateCurrentAmount();
    return this.save();
};

// Withdraw money from goal
savingsGoalSchema.methods.withdrawMoney = function (amount, description = '') {
    if (amount > this.currentAmount) {
        throw new Error('Insufficient funds');
    }
    this.transactions.push({
        type: 'withdraw',
        amount,
        description
    });
    this.calculateCurrentAmount();
    return this.save();
};

// Get progress percentage
savingsGoalSchema.virtual('progressPercentage').get(function () {
    if (this.targetAmount === 0) return 0;
    return (this.currentAmount / this.targetAmount) * 100;
});

// Get days until deadline
savingsGoalSchema.virtual('daysUntilDeadline').get(function () {
    if (!this.deadline) return null;
    const today = new Date();
    const deadline = new Date(this.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Ensure virtuals are included in JSON
savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
