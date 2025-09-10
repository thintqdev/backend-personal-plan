const mongoose = require("mongoose");

const activationTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        token: {
            type: String,
            required: true,
            unique: true
        },
        type: {
            type: String,
            enum: ['email_verification', 'password_reset'],
            required: true
        },
        expiredAt: {
            type: Date,
            required: true
        },
        isUsed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

// Index cho performance
activationTokenSchema.index({ token: 1 });
activationTokenSchema.index({ userId: 1, type: 1 });
activationTokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 }); // Auto delete expired tokens

module.exports = mongoose.model("ActivationToken", activationTokenSchema);
