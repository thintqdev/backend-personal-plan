const fs = require('fs').promises;
const path = require('path');
const sendEmail = require('../utils/sendEmail');

class EmailQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.queueFile = path.join(__dirname, '../data/email-queue.json');
        this.logFile = path.join(__dirname, '../logs/email-logs.txt');
        this.retryLimit = 3;
        this.retryDelay = 5000; // 5 seconds

        // Ensure directories exist
        this.ensureDirectories();

        // Load existing queue on startup
        this.loadQueue();

        // Start processing queue
        this.startProcessing();
    }

    async ensureDirectories() {
        try {
            await fs.mkdir(path.dirname(this.queueFile), { recursive: true });
            await fs.mkdir(path.dirname(this.logFile), { recursive: true });
        } catch (error) {
            console.error('Error creating directories:', error);
        }
    }

    async log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;

        try {
            await fs.appendFile(this.logFile, logEntry);
            console.log(`Email Log: ${message}`);
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }

    async saveQueue() {
        try {
            await fs.writeFile(this.queueFile, JSON.stringify(this.queue, null, 2));
        } catch (error) {
            await this.log(`Error saving queue: ${error.message}`, 'ERROR');
        }
    }

    async loadQueue() {
        try {
            const data = await fs.readFile(this.queueFile, 'utf8');
            this.queue = JSON.parse(data) || [];
            await this.log(`Loaded ${this.queue.length} emails from queue`);
        } catch (error) {
            // File doesn't exist or is invalid, start with empty queue
            this.queue = [];
            await this.log('Started with empty email queue');
        }
    }

    /**
     * Add email to queue
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - Email HTML content
     * @param {Object} options - Additional options (priority, delay, etc.)
     * @returns {string} Job ID
     */
    async addToQueue(to, subject, html, options = {}) {
        const jobId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            to,
            subject,
            html,
            priority: options.priority || 'normal', // high, normal, low
            delay: options.delay || 0, // delay in milliseconds
            attempts: 0,
            maxAttempts: options.maxAttempts || this.retryLimit,
            createdAt: new Date().toISOString(),
            scheduledAt: new Date(Date.now() + (options.delay || 0)).toISOString(),
            status: 'pending' // pending, processing, completed, failed
        };

        this.queue.push(job);
        await this.saveQueue();
        await this.log(`Email queued: ${jobId} | To: ${to} | Subject: ${subject}`);

        return jobId;
    }

    /**
     * Get next job to process
     * @returns {Object|null} Next job or null if none available
     */
    getNextJob() {
        const now = new Date();

        // Sort by priority (high > normal > low) and then by scheduled time
        const availableJobs = this.queue.filter(job =>
            job.status === 'pending' &&
            new Date(job.scheduledAt) <= now
        ).sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(a.scheduledAt) - new Date(b.scheduledAt);
        });

        return availableJobs[0] || null;
    }

    /**
     * Process a single email job
     * @param {Object} job - Email job to process
     */
    async processJob(job) {
        job.status = 'processing';
        job.attempts++;
        job.lastAttemptAt = new Date().toISOString();

        await this.log(`Processing email: ${job.id} | Attempt: ${job.attempts}/${job.maxAttempts} | To: ${job.to}`);
        await this.saveQueue();

        try {
            // Send the email with timeout
            const sendPromise = sendEmail(job.to, job.subject, job.html);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Email sending timeout after 30 seconds')), 30000);
            });

            await Promise.race([sendPromise, timeoutPromise]);

            // Mark as completed
            job.status = 'completed';
            job.completedAt = new Date().toISOString();

            await this.log(`Email sent successfully: ${job.id} | To: ${job.to} | Subject: ${job.subject}`, 'SUCCESS');
            await this.saveQueue();

        } catch (error) {
            await this.log(`Email send failed: ${job.id} | Error: ${error.message}`, 'ERROR');

            if (job.attempts >= job.maxAttempts) {
                // Max attempts reached, mark as failed
                job.status = 'failed';
                job.failedAt = new Date().toISOString();
                job.lastError = error.message;

                await this.log(`Email permanently failed: ${job.id} | Max attempts reached | To: ${job.to}`, 'ERROR');
            } else {
                // Schedule retry
                job.status = 'pending';
                job.scheduledAt = new Date(Date.now() + this.retryDelay * job.attempts).toISOString();

                await this.log(`Email retry scheduled: ${job.id} | Next attempt in ${this.retryDelay * job.attempts}ms`);
            }

            await this.saveQueue();
            throw error; // Re-throw to handle in processing loop
        }
    }

    /**
     * Start processing queue
     */
    async startProcessing() {
        if (this.processing) return;

        this.processing = true;
        await this.log('Email queue processing started');

        const process = async () => {
            try {
                const job = this.getNextJob();

                if (job) {
                    await this.processJob(job);
                }
            } catch (error) {
                // Error already logged in processJob
            }

            // Continue processing
            setTimeout(process, 1000); // Check for new jobs every second
        };

        process();
    }

    /**
     * Get queue statistics
     * @returns {Object} Queue statistics
     */
    getStats() {
        const stats = {
            total: this.queue.length,
            pending: this.queue.filter(j => j.status === 'pending').length,
            processing: this.queue.filter(j => j.status === 'processing').length,
            completed: this.queue.filter(j => j.status === 'completed').length,
            failed: this.queue.filter(j => j.status === 'failed').length
        };

        return stats;
    }

    /**
     * Get job status
     * @param {string} jobId - Job ID
     * @returns {Object|null} Job details or null if not found
     */
    getJobStatus(jobId) {
        return this.queue.find(job => job.id === jobId) || null;
    }

    /**
     * Cleanup old completed/failed jobs
     * @param {number} maxAge - Maximum age in milliseconds (default: 7 days)
     */
    async cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) {
        const cutoff = new Date(Date.now() - maxAge);
        const initialCount = this.queue.length;

        this.queue = this.queue.filter(job => {
            if (job.status === 'pending' || job.status === 'processing') {
                return true; // Keep pending and processing jobs
            }

            const jobDate = new Date(job.completedAt || job.failedAt || job.createdAt);
            return jobDate > cutoff;
        });

        const removedCount = initialCount - this.queue.length;

        if (removedCount > 0) {
            await this.saveQueue();
            await this.log(`Cleaned up ${removedCount} old email jobs`);
        }
    }

    /**
     * Reset stuck jobs that have been processing for too long
     * @param {number} maxProcessingTimeMinutes - Max time in minutes a job can be processing
     * @returns {Object} Reset result
     */
    async resetStuckJobs(maxProcessingTimeMinutes = 5) {
        const cutoffTime = new Date(Date.now() - maxProcessingTimeMinutes * 60 * 1000);
        const stuckJobs = [];
        let resetCount = 0;

        for (const job of this.queue) {
            if (job.status === 'processing' && job.lastAttemptAt) {
                const lastAttempt = new Date(job.lastAttemptAt);
                if (lastAttempt < cutoffTime) {
                    // Reset stuck job to pending
                    job.status = 'pending';
                    job.scheduledAt = new Date().toISOString();
                    stuckJobs.push({
                        id: job.id,
                        to: job.to,
                        lastAttemptAt: job.lastAttemptAt,
                        stuckFor: Math.round((Date.now() - lastAttempt.getTime()) / 1000 / 60) + ' minutes'
                    });
                    resetCount++;

                    await this.log(`Reset stuck job: ${job.id} | Stuck for ${Math.round((Date.now() - lastAttempt.getTime()) / 1000 / 60)} minutes`);
                }
            }
        }

        if (resetCount > 0) {
            await this.saveQueue();
            await this.log(`Reset ${resetCount} stuck email jobs`);
        }

        return {
            resetCount,
            details: stuckJobs
        };
    }
}

// Create singleton instance
const emailQueue = new EmailQueue();

module.exports = emailQueue;
