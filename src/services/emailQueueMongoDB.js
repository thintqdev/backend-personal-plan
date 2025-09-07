const EmailJob = require('../models/EmailJob');
const sendEmail = require('../utils/sendEmail');
const { v4: uuidv4 } = require('uuid');

class EmailQueue {
    constructor() {
        this.processing = false;
        this.retryLimit = 3;
        this.retryDelay = 5000; // 5 seconds
        this.processTimeout = 30000; // 30 seconds

        // Start processing queue after short delay to ensure DB connection
        setTimeout(() => {
            this.loadQueue();
            this.startProcessing();
        }, 2000);
    }

    async log(jobId, message, level = 'info') {
        const timestamp = new Date();
        console.log(`Email Log [${jobId}]: ${message}`);

        try {
            if (jobId) {
                await EmailJob.findOneAndUpdate(
                    { jobId },
                    {
                        $push: {
                            logs: { timestamp, level, message }
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error logging to database:', error);
        }
    }

    async loadQueue() {
        try {
            // Count jobs by status
            const stats = await EmailJob.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            console.log('Email Job Stats:', stats);

            // Reset stuck jobs (processing for too long)
            const stuckThreshold = new Date(Date.now() - this.processTimeout);
            const stuckResult = await EmailJob.updateMany(
                {
                    status: 'processing',
                    processedAt: { $lt: stuckThreshold }
                },
                {
                    status: 'stuck',
                    $inc: { attempts: 1 }
                }
            );

            if (stuckResult.modifiedCount > 0) {
                console.log(`Reset ${stuckResult.modifiedCount} stuck email jobs`);
            }

            // Count pending jobs
            const pendingCount = await EmailJob.countDocuments({
                status: { $in: ['pending', 'stuck'] },
                scheduledAt: { $lte: new Date() }
            });

            await this.log(null, `Loaded ${pendingCount} pending emails from queue`);
        } catch (error) {
            console.error('Error loading queue from database:', error);
        }
    }

    async addToQueue(to, subject, html, options = {}) {
        try {
            const jobId = uuidv4();
            const { priority = 'normal', delay = 0 } = options;

            const scheduledAt = new Date(Date.now() + delay);

            const emailJob = new EmailJob({
                jobId,
                to,
                subject,
                html,
                priority,
                scheduledAt,
                delay
            });

            await emailJob.save();
            await this.log(jobId, `Email queued for ${to} - Subject: ${subject}`);

            return jobId;
        } catch (error) {
            console.error('Error adding email to queue:', error);
            throw error;
        }
    }

    async startProcessing() {
        if (this.processing) return;

        this.processing = true;
        await this.log(null, 'Email queue processing started');

        // Process queue every 5 seconds
        setInterval(async () => {
            await this.processQueue();
        }, 5000);
    }

    async processQueue() {
        try {
            // Get next job to process (priority order: high > normal > low)
            const job = await EmailJob.findOneAndUpdate(
                {
                    status: { $in: ['pending', 'stuck'] },
                    scheduledAt: { $lte: new Date() },
                    attempts: { $lt: this.retryLimit }
                },
                {
                    status: 'processing',
                    processedAt: new Date(),
                    $inc: { attempts: 1 }
                },
                {
                    sort: {
                        priority: -1, // high = 1, normal = 0, low = -1 (need to map this)
                        scheduledAt: 1
                    },
                    new: true
                }
            );

            if (!job) return; // No jobs to process

            await this.processEmailJob(job);

        } catch (error) {
            console.error('Error processing queue:', error);
        }
    }

    async processEmailJob(job) {
        const startTime = Date.now();

        try {
            await this.log(job.jobId, `Processing email to ${job.to} (attempt ${job.attempts}/${this.retryLimit})`);

            // Set timeout for email sending
            const emailPromise = sendEmail(job.to, job.subject, job.html);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Email sending timeout')), this.processTimeout);
            });

            await Promise.race([emailPromise, timeoutPromise]);

            // Success
            await EmailJob.findOneAndUpdate(
                { jobId: job.jobId },
                {
                    status: 'completed',
                    completedAt: new Date(),
                    lastError: null
                }
            );

            const duration = Date.now() - startTime;
            await this.log(job.jobId, `Email sent successfully in ${duration}ms`);

        } catch (error) {
            await this.log(job.jobId, `Email sending failed: ${error.message}`, 'error');

            if (job.attempts >= this.retryLimit) {
                // Max attempts reached
                await EmailJob.findOneAndUpdate(
                    { jobId: job.jobId },
                    {
                        status: 'failed',
                        lastError: error.message
                    }
                );
                await this.log(job.jobId, `Email failed permanently after ${job.attempts} attempts`, 'error');
            } else {
                // Schedule retry
                const retryDelay = this.retryDelay * Math.pow(2, job.attempts - 1); // Exponential backoff
                const nextRetry = new Date(Date.now() + retryDelay);

                await EmailJob.findOneAndUpdate(
                    { jobId: job.jobId },
                    {
                        status: 'pending',
                        scheduledAt: nextRetry,
                        lastError: error.message
                    }
                );

                await this.log(job.jobId, `Email scheduled for retry in ${retryDelay}ms`, 'warn');
            }
        }
    }

    async getJobStatus(jobId) {
        try {
            const job = await EmailJob.findOne({ jobId });
            return job;
        } catch (error) {
            console.error('Error getting job status:', error);
            return null;
        }
    }

    async getStats() {
        try {
            const stats = await EmailJob.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const result = {
                pending: 0,
                processing: 0,
                completed: 0,
                failed: 0,
                stuck: 0
            };

            stats.forEach(stat => {
                result[stat._id] = stat.count;
            });

            return result;
        } catch (error) {
            console.error('Error getting queue stats:', error);
            return null;
        }
    }

    async cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
        try {
            const cutoffDate = new Date(Date.now() - maxAge);

            const result = await EmailJob.deleteMany({
                $or: [
                    { status: 'completed', completedAt: { $lt: cutoffDate } },
                    { status: 'failed', updatedAt: { $lt: cutoffDate } }
                ]
            });

            console.log(`Cleaned up ${result.deletedCount} old email jobs`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning up email jobs:', error);
            throw error;
        }
    }

    async resetStuckJobs() {
        try {
            const result = await EmailJob.updateMany(
                { status: 'processing' },
                { status: 'pending', processedAt: null }
            );

            console.log(`Reset ${result.modifiedCount} stuck jobs to pending`);
            return result.modifiedCount;
        } catch (error) {
            console.error('Error resetting stuck jobs:', error);
            throw error;
        }
    }
}

module.exports = new EmailQueue();
