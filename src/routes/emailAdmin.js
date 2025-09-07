const express = require("express");
const router = express.Router();
const EmailJob = require('../models/EmailJob');
const emailQueue = require('../services/emailQueueMongoDB');
const fs = require('fs').promises;
const path = require('path');

/**
 * @swagger
 * /api/admin/email/stats:
 *   get:
 *     summary: Get email queue statistics
 *     tags: [Admin - Email]
 *     responses:
 *       200:
 *         description: Email queue statistics
 */
router.get("/stats", async (req, res) => {
    try {
        const stats = await emailQueue.getStats();
        const recentJobs = await EmailJob.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('jobId to subject status attempts createdAt scheduledAt completedAt lastError');

        res.json({
            stats,
            recentJobs,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting email stats:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/email/job/{jobId}:
 *   get:
 *     summary: Get email job status
 *     tags: [Admin - Email]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Email job ID
 *     responses:
 *       200:
 *         description: Email job details
 *       404:
 *         description: Job not found
 */
router.get("/job/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await emailQueue.getJobStatus(jobId);

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json(job);
    } catch (error) {
        console.error('Error getting job status:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/email/logs:
 *   get:
 *     summary: Get email logs
 *     tags: [Admin - Email]
 *     parameters:
 *       - in: query
 *         name: lines
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of lines to retrieve
 *     responses:
 *       200:
 *         description: Email logs
 */
router.get("/logs", async (req, res) => {
    try {
        const lines = parseInt(req.query.lines) || 100;
        const logFile = path.join(__dirname, '../logs/email-logs.txt');

        try {
            const data = await fs.readFile(logFile, 'utf8');
            const logLines = data.trim().split('\n');
            const recentLogs = logLines.slice(-lines);

            res.json({
                totalLines: logLines.length,
                requestedLines: lines,
                logs: recentLogs
            });
        } catch (fileError) {
            if (fileError.code === 'ENOENT') {
                res.json({
                    totalLines: 0,
                    requestedLines: lines,
                    logs: []
                });
            } else {
                throw fileError;
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/email/cleanup:
 *   post:
 *     summary: Cleanup old email jobs
 *     tags: [Admin - Email]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxAge:
 *                 type: integer
 *                 description: Maximum age in hours (default 168 = 7 days)
 *                 default: 168
 *     responses:
 *       200:
 *         description: Cleanup completed
 */
router.post("/cleanup", async (req, res) => {
    try {
        const { maxAge = 168 } = req.body; // Default 7 days in hours
        const maxAgeMs = maxAge * 60 * 60 * 1000; // Convert to milliseconds

        await emailService.cleanup(maxAgeMs);

        res.json({
            message: "Cleanup completed",
            maxAgeHours: maxAge
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/email/reset-stuck:
 *   post:
 *     summary: Reset stuck email jobs
 *     tags: [Admin - Email]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxProcessingTime:
 *                 type: integer
 *                 description: Max time in minutes an email can be processing (default 5)
 *                 default: 5
 *     responses:
 *       200:
 *         description: Stuck jobs reset
 */
router.post("/reset-stuck", async (req, res) => {
    try {
        const { maxProcessingTime = 5 } = req.body; // Default 5 minutes
        const result = await emailService.resetStuckJobs(maxProcessingTime);

        res.json({
            message: "Stuck jobs reset completed",
            resetCount: result.resetCount,
            details: result.details
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/admin/email/test:
 *   post:
 *     summary: Send test email
 *     tags: [Admin - Email]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Test email recipient
 *               priority:
 *                 type: string
 *                 enum: [high, normal, low]
 *                 default: normal
 *                 description: Email priority
 *               delay:
 *                 type: integer
 *                 default: 0
 *                 description: Delay in seconds
 *     responses:
 *       200:
 *         description: Test email queued
 */
router.post("/test", async (req, res) => {
    try {
        const { to, priority = 'normal', delay = 0 } = req.body;

        if (!to) {
            return res.status(400).json({ error: "Email recipient is required" });
        }

        const subject = "ThinPlan - Test Email";
        const html = `
            <h2>Test Email</h2>
            <p>This is a test email from ThinPlan email queue system.</p>
            <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
            <p><strong>Priority:</strong> ${priority}</p>
            <p><strong>Delay:</strong> ${delay} seconds</p>
        `;

        let jobId;
        const delayMs = delay * 1000;

        if (priority === 'high') {
            jobId = await emailService.sendImmediate(to, subject, html);
        } else if (priority === 'low') {
            jobId = await emailService.sendLowPriority(to, subject, html);
        } else if (delay > 0) {
            jobId = await emailService.sendDelayed(to, subject, html, delayMs);
        } else {
            jobId = await emailService.send(to, subject, html);
        }

        res.json({
            message: "Test email queued",
            jobId,
            priority,
            delay: delay + " seconds"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
