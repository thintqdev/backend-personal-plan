const express = require("express");
const router = express.Router();
const quoteController = require("../controllers/quoteController");

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
router.get("/", quoteController.getQuotes);
router.post("/", quoteController.createQuote);
router.put("/:id", quoteController.updateQuote);
router.delete("/:id", quoteController.deleteQuote);

module.exports = router;
