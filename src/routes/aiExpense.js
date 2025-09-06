const express = require('express');
const router = express.Router();
const {
    parseExpenseText,
    getExpenseSuggestions,
    createExpenseFromAI
} = require('../controllers/aiExpenseController');

/**
 * @swagger
 * components:
 *   schemas:
 *     AIExpenseParseResult:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           description: Số tiền chi tiêu
 *         description:
 *           type: string
 *           description: Mô tả chi tiêu
 *         jarName:
 *           type: string
 *           description: Tên hũ chi tiêu được AI đề xuất
 *         jarId:
 *           type: string
 *           description: ID hũ chi tiêu phù hợp
 *         category:
 *           type: string
 *           description: Danh mục chi tiêu
 *         confidence:
 *           type: number
 *           description: Độ tin cậy của AI (0-100)
 *         suggestions:
 *           type: array
 *           items:
 *             type: string
 *           description: Gợi ý nếu thông tin chưa đầy đủ
 */

/**
 * @swagger
 * /api/ai-expense/parse:
 *   post:
 *     summary: Phân tích chi tiêu từ ngôn ngữ tự nhiên bằng AI
 *     tags: [AI Expense]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Câu mô tả chi tiêu bằng ngôn ngữ tự nhiên
 *                 example: "Tôi vừa mua cà phê 50k"
 *     responses:
 *       200:
 *         description: Phân tích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AIExpenseParseResult'
 *                 message:
 *                   type: string
 */
router.post('/parse', parseExpenseText);

/**
 * @swagger
 * /api/ai-expense/suggestions:
 *   get:
 *     summary: Lấy gợi ý chi tiêu dựa trên lịch sử
 *     tags: [AI Expense]
 *     responses:
 *       200:
 *         description: Danh sách gợi ý
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recentCount:
 *                       type: number
 *                     jarsCount:
 *                       type: number
 */
router.get('/suggestions', getExpenseSuggestions);

/**
 * @swagger
 * /api/ai-expense/create:
 *   post:
 *     summary: Tạo giao dịch chi tiêu từ AI parsing
 *     tags: [AI Expense]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Câu mô tả chi tiêu
 *               override:
 *                 type: object
 *                 description: Thông tin ghi đè kết quả AI
 *                 properties:
 *                   amount:
 *                     type: number
 *                   jarId:
 *                     type: string
 *                   category:
 *                     type: string
 *                   description:
 *                     type: string
 *     responses:
 *       201:
 *         description: Tạo giao dịch thành công
 */
router.post('/create', createExpenseFromAI);

module.exports = router;
