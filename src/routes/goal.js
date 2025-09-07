const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");
const auth = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Goal:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - priority
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *         status:
 *           type: string
 *           enum: [Not Started, In Progress, Completed, On Hold]
 *         targetDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         __v:
 *           type: number
 *     CreateGoalRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - priority
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *         status:
 *           type: string
 *           enum: [Not Started, In Progress, Completed, On Hold]
 *         targetDate:
 *           type: string
 *           format: date-time
 *     UpdateGoalRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *         status:
 *           type: string
 *           enum: [Not Started, In Progress, Completed, On Hold]
 *         targetDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Lấy tất cả goals
 *     tags: [Goals]
 *     responses:
 *       200:
 *         description: Danh sách goals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Goal'
 *   post:
 *     summary: Tạo goal mới
 *     tags: [Goals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGoalRequest'
 *     responses:
 *       201:
 *         description: Goal được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */

/**
 * @swagger
 * /api/goals/{id}:
 *   get:
 *     summary: Lấy goal theo ID
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 *       404:
 *         description: Goal not found
 *   put:
 *     summary: Cập nhật goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGoalRequest'
 *     responses:
 *       200:
 *         description: Goal được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 *       404:
 *         description: Goal not found
 *   delete:
 *     summary: Xóa goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal được xóa thành công
 *       404:
 *         description: Goal not found
 */

/**
 * @swagger
 * /api/goals/filter:
 *   get:
 *     summary: Lọc goals theo điều kiện
 *     tags: [Goals]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Not Started, In Progress, Completed, On Hold]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách goals đã lọc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Goal'
 */

/**
 * @swagger
 * /api/goals/stats:
 *   get:
 *     summary: Thống kê goals
 *     tags: [Goals]
 *     responses:
 *       200:
 *         description: Thống kê goals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalGoals:
 *                   type: number
 *                 completedGoals:
 *                   type: number
 *                 inProgressGoals:
 *                   type: number
 *                 notStartedGoals:
 *                   type: number
 *                 onHoldGoals:
 *                   type: number
 *                 completionRate:
 *                   type: number
 *                 priorityBreakdown:
 *                   type: object
 */

// Routes
router.get("/", auth, goalController.getAllGoals);
router.get("/filter", auth, goalController.getGoalsByFilter);
router.get("/stats", auth, goalController.getGoalStats);
router.get("/:id", auth, goalController.getGoalById);
router.post("/", auth, goalController.createGoal);
router.put("/:id", auth, goalController.updateGoal);
router.delete("/:id", auth, goalController.deleteGoal);

// SubGoal routes
router.post("/:id/subgoals", auth, goalController.addSubGoal);
router.put("/:goalId/subgoals/:subgoalId", auth, goalController.updateSubGoal);
router.delete("/:goalId/subgoals/:subgoalId", auth, goalController.deleteSubGoal);

module.exports = router;
