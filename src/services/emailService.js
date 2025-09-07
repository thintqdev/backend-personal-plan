const emailQueue = require('./emailQueue');

/**
 * Email service with queue support
 */
class EmailService {

    /**
     * Send email immediately (high priority, no delay)
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject  
     * @param {string} html - Email HTML content
     * @returns {Promise<string>} Job ID
     */
    async sendImmediate(to, subject, html) {
        return await emailQueue.addToQueue(to, subject, html, {
            priority: 'high',
            delay: 0
        });
    }

    /**
     * Send email with normal priority
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - Email HTML content
     * @returns {Promise<string>} Job ID
     */
    async send(to, subject, html) {
        return await emailQueue.addToQueue(to, subject, html, {
            priority: 'normal'
        });
    }

    /**
     * Send email with low priority
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - Email HTML content
     * @returns {Promise<string>} Job ID
     */
    async sendLowPriority(to, subject, html) {
        return await emailQueue.addToQueue(to, subject, html, {
            priority: 'low'
        });
    }

    /**
     * Schedule email for later
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - Email HTML content
     * @param {number} delay - Delay in milliseconds
     * @returns {Promise<string>} Job ID
     */
    async sendDelayed(to, subject, html, delay) {
        return await emailQueue.addToQueue(to, subject, html, {
            priority: 'normal',
            delay
        });
    }

    /**
     * Send verification email
     * @param {string} to - User email
     * @param {string} name - User name
     * @param {string} verifyUrl - Verification URL
     * @returns {Promise<string>} Job ID
     */
    async sendVerificationEmail(to, name, verifyUrl) {
        const verifyEmailTemplate = require('../templates/verifyEmailTemplate');
        const html = verifyEmailTemplate({ name, verifyUrl });

        return await this.sendImmediate(to, "Xác thực tài khoản ThinPlan", html);
    }

    /**
     * Resend verification email
     * @param {string} to - User email
     * @param {string} name - User name
     * @param {string} verifyUrl - Verification URL
     * @returns {Promise<string>} Job ID
     */
    async resendVerificationEmail(to, name, verifyUrl) {
        const verifyEmailTemplate = require('../templates/verifyEmailTemplate');
        const html = verifyEmailTemplate({ name, verifyUrl });

        return await this.sendImmediate(to, "Xác thực tài khoản ThinPlan (Gửi lại)", html);
    }

    /**
     * Send password reset email
     * @param {string} to - User email
     * @param {string} name - User name
     * @param {string} resetUrl - Reset URL
     * @returns {Promise<string>} Job ID
     */
    async sendPasswordResetEmail(to, name, resetUrl) {
        const resetPasswordTemplate = require('../templates/resetPasswordTemplate');
        const html = resetPasswordTemplate({ name, resetUrl });

        return await this.sendImmediate(to, "Đặt lại mật khẩu ThinPlan", html);
    }

    /**
     * Resend verification email (with different subject)
     * @param {string} to - User email
     * @param {string} name - User name
     * @param {string} verifyUrl - Verification URL
     * @returns {Promise<string>} Job ID
     */
    async resendVerificationEmail(to, name, verifyUrl) {
        const verifyEmailTemplate = require('../templates/verifyEmailTemplate');
        const html = verifyEmailTemplate({ name, verifyUrl });

        return await this.sendImmediate(to, "Xác thực tài khoản ThinPlan (Gửi lại)", html);
    }

    /**
     * Get job status
     * @param {string} jobId - Job ID
     * @returns {Object|null} Job status
     */
    getJobStatus(jobId) {
        return emailQueue.getJobStatus(jobId);
    }

    /**
     * Get queue statistics
     * @returns {Object} Queue stats
     */
    getStats() {
        return emailQueue.getStats();
    }

    /**
     * Cleanup old jobs
     * @param {number} maxAge - Maximum age in milliseconds
     */
    async cleanup(maxAge) {
        return await emailQueue.cleanup(maxAge);
    }

    /**
     * Reset stuck jobs that have been processing for too long
     * @param {number} maxProcessingTimeMinutes - Max time in minutes
     * @returns {Object} Reset result
     */
    async resetStuckJobs(maxProcessingTimeMinutes = 5) {
        return await emailQueue.resetStuckJobs(maxProcessingTimeMinutes);
    }
}

// Export singleton instance
module.exports = new EmailService();
