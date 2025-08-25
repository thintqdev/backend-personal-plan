const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan
 *     responses:
 *       200:
 *         description: Thống kê tổng quan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todayProgress:
 *                   type: string
 *                   example: "3/6"
 *                 weekProgress:
 *                   type: number
 *                   example: 75
 *                 currentStreak:
 *                   type: number
 *                   example: 45
 *                 totalTasks:
 *                   type: number
 *                   example: 42
 *                 completedTasks:
 *                   type: number
 *                   example: 35
 */
router.get("/", statsController.getGeneralStats);

/**
 * @swagger
 * /api/stats/today:
 *   get:
 *     summary: Thống kê hôm nay
 *     responses:
 *       200:
 *         description: Thống kê hôm nay
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todayProgress:
 *                   type: string
 *                 totalTasks:
 *                   type: number
 *                 completedTasks:
 *                   type: number
 */
router.get("/today", statsController.getTodayStats);

/**
 * @swagger
 * /api/stats/week:
 *   get:
 *     summary: Thống kê tuần
 *     responses:
 *       200:
 *         description: Thống kê tuần
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weekProgress:
 *                   type: number
 *                 totalTasks:
 *                   type: number
 *                 completedTasks:
 *                   type: number
 */
router.get("/week", statsController.getWeekStats);

module.exports = router;
