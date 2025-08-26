const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Lấy thông tin cá nhân
 *     tags: [User]
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
 *                 income:
 *                   type: number
 *                 preferences:
 *                   type: object
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [User]
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
 *               income:
 *                 type: number
 *     responses:
 *       200:
 *         description: "Thông tin cá nhân đã cập nhật"
 * /api/user/preferences:
 *   get:
 *     summary: Lấy preferences
 *     tags: [User]
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
 *     tags: [User]
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
 * /api/user/income:
 *   put:
 *     summary: Cập nhật thu nhập
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - income
 *             properties:
 *               income:
 *                 type: number
 *                 minimum: 0
 *                 example: 15000000
 *                 description: Thu nhập hàng tháng (VND)
 *     responses:
 *       200:
 *         description: Thu nhập đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Income updated successfully"
 *                 income:
 *                   type: number
 *                   example: 15000000
 *                 user:
 *                   type: object
 *       400:
 *         description: Income không hợp lệ
 *       404:
 *         description: User không tồn tại
 */
router.get("/", userController.getUser);
router.put("/", userController.updateUser);

// New preferences endpoints
router.get("/preferences", userController.getUserPreferences);
router.put("/preferences", userController.updateUserPreferences);

// Income endpoint
router.put("/income", userController.updateUserIncome);

module.exports = router;
