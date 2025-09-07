const mongoose = require("mongoose");

const emailJobSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            required: true,
            unique: true
        },
        to: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        html: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'stuck'],
            default: 'pending'
        },
        priority: {
            type: String,
            enum: ['low', 'normal', 'high'],
            default: 'normal'
        },
        attempts: {
            type: Number,
            default: 0
        },
        maxAttempts: {
            type: Number,
            default: 3
        },
        delay: {
            type: Number,
            default: 0
        },
        scheduledAt: {
            type: Date,
            default: Date.now
        },
        processedAt: {
            type: Date
        },
        completedAt: {
            type: Date
        },
        lastError: {
            type: String
        },
        logs: [{
            timestamp: { type: Date, default: Date.now },
            level: { type: String, enum: ['info', 'warn', 'error'] },
            message: String
        }]
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
emailJobSchema.index({ status: 1, scheduledAt: 1 });
emailJobSchema.index({ jobId: 1 });
emailJobSchema.index({ priority: 1, scheduledAt: 1 });
emailJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // Auto delete after 7 days

module.exports = mongoose.model("EmailJob", emailJobSchema);
