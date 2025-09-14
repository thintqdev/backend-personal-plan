const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const {
    processJLPTReading
} = require('../controllers/aiController');

/**
 * @swagger
 * /api/ai/process-jlpt-reading:
 *   post:
 *     summary: Xử lý bài đọc JLPT và tạo câu hỏi, ngữ pháp, từ vựng
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passage
 *             properties:
 *               passage:
 *                 type: string
 *                 description: Bài đọc JLPT
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           question:
 *                             type: string
 *                           options:
 *                             type: array
 *                             items:
 *                               type: string
 *                           correctIndex:
 *                             type: integer
 *                           explanation:
 *                             type: string
 *                     grammar:
 *                       type: object
 *                       properties:
 *                         N5:
 *                           type: array
 *                           items:
 *                             type: string
 *                         N4:
 *                           type: array
 *                           items:
 *                             type: string
 *                         N3:
 *                           type: array
 *                           items:
 *                             type: string
 *                         N2:
 *                           type: array
 *                           items:
 *                             type: string
 *                         N1:
 *                           type: array
 *                           items:
 *                             type: string
 *                     vocabulary:
 *                       type: object
 *                       properties:
 *                         N5:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               word:
 *                                 type: string
 *                               meaning:
 *                                 type: string
 *                               reading:
 *                                 type: string
 *                         N4:
 *                           type: array
 *                           items:
 *                             type: object
 *                         N3:
 *                           type: array
 *                           items:
 *                             type: object
 *                         N2:
 *                           type: array
 *                           items:
 *                             type: object
 *                         N1:
 *                           type: array
 *                           items:
 *                             type: object
 */
router.post('/process-jlpt-reading', auth, processJLPTReading);

module.exports = router;