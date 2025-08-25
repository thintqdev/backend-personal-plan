const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Lấy thông tin cá nhân
 *     responses:
 *       200:
 *         description: "Thông tin cá nhân"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 goal:
 *                   type: string
 *                 streak:
 *                   type: number
 *                 avatar:
 *                   type: string
 *                 preferences:
 *                   type: object
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               goal:
 *                 type: string
 *               streak:
 *                 type: number
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Thông tin cá nhân đã cập nhật"
 * /api/user/preferences:
 *   get:
 *     summary: Lấy preferences
 *     responses:
 *       200:
 *         description: User preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 theme:
 *                   type: string
 *                   example: "violet"
 *                 coverImage:
 *                   type: string
 *                 notifications:
 *                   type: boolean
 *                   example: true
 *                 language:
 *                   type: string
 *                   example: "vi"
 *   put:
 *     summary: Cập nhật preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               notifications:
 *                 type: boolean
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Preferences đã cập nhật
 */
router.get("/", userController.getUser);
router.put("/", userController.updateUser);

// New preferences endpoints
router.get("/preferences", userController.getUserPreferences);
router.put("/preferences", userController.updateUserPreferences);

module.exports = router;
