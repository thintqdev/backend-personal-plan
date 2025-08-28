const express = require("express");
const router = express.Router();
const quoteController = require("../controllers/quoteController");
const { authenticateJWT, optionalJWT } = require("../middlewares/jwtAuth");

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: Lấy danh sách câu châm ngôn
 *     responses:
 *       200:
 *         description: "Danh sách câu châm ngôn"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   text:
 *                     type: string
 *   post:
 *     summary: Thêm câu châm ngôn mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Đã tạo câu châm ngôn"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 text:
 *                   type: string
 * /api/quotes/{id}:
 *   put:
 *     summary: Sửa câu châm ngôn
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
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Đã sửa câu châm ngôn"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 text:
 *                   type: string
 *   delete:
 *     summary: Xoá câu châm ngôn
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Đã xoá câu châm ngôn"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/", optionalJWT, quoteController.getQuotes);
router.post("/", authenticateJWT, quoteController.createQuote);
router.put("/:id", authenticateJWT, quoteController.updateQuote);
router.delete("/:id", authenticateJWT, quoteController.deleteQuote);

module.exports = router;
