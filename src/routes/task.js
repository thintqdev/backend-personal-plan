const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authenticateJWT, optionalJWT } = require("../middlewares/jwtAuth");

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Lấy danh sách công việc theo thứ trong tuần
 *     parameters:
 *       - in: query
 *         name: day
 *         required: true
 *         schema:
 *           type: string
 *         description: "Thứ trong tuần (VD: Thứ Hai, Thứ Ba, ...)"
 *     responses:
 *       200:
 *         description: Danh sách tasks theo thứ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 day:
 *                   type: string
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       time:
 *                         type: string
 *                       task:
 *                         type: string
 *                       type:
 *                         type: string
 *                       completed:
 *                         type: boolean
 *   post:
 *     summary: Thêm công việc mới
 * /api/tasks/{id}:
 *   put:
 *     summary: Sửa công việc
 *   delete:
 *     summary: Xoá công việc
 * /api/tasks/{id}/complete:
 *   patch:
 *     summary: Toggle hoàn thành task
 * /api/tasks/{id}/status:
 *   get:
 *     summary: Lấy trạng thái task
 */
router.get("/", optionalJWT, taskController.getTasks); // ?day=Thứ Hai
router.post("/", authenticateJWT, taskController.createTask);
router.put("/:id", authenticateJWT, taskController.updateTask);
router.delete("/:id", authenticateJWT, taskController.deleteTask);

// Task completion endpoints
router.patch("/:id/complete", authenticateJWT, taskController.toggleTaskComplete);
router.get("/:id/status", optionalJWT, taskController.getTaskStatus);

module.exports = router;
