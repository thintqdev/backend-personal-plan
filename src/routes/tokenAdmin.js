const express = require('express');
const ActivationToken = require('../models/ActivationToken');
const { cleanupExpiredTokens, getTokenStats } = require('../utils/tokenUtils');
const auth = require('../middleware/auth'); // Middleware xác thực admin

const router = express.Router();

/**
 * @swagger
 * /api/admin/tokens/stats:
 *   get:
 *     tags: [Admin - Tokens]
 *     summary: Get activation token statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token statistics
 */
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await getTokenStats();
        const totalTokens = await ActivationToken.countDocuments();

        res.json({
            success: true,
            data: {
                totalTokens,
                byType: stats
            }
        });
    } catch (error) {
        console.error('Get token stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @swagger
 * /api/admin/tokens/cleanup:
 *   delete:
 *     tags: [Admin - Tokens]
 *     summary: Cleanup expired and used tokens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed
 */
router.delete('/cleanup', auth, async (req, res) => {
    try {
        const deletedCount = await cleanupExpiredTokens();

        res.json({
            success: true,
            message: `Đã xóa ${deletedCount} tokens hết hạn/đã sử dụng`,
            deletedCount
        });
    } catch (error) {
        console.error('Token cleanup error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @swagger
 * /api/admin/tokens:
 *   get:
 *     tags: [Admin - Tokens]
 *     summary: List all activation tokens with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [email_verification, password_reset]
 *     responses:
 *       200:
 *         description: List of tokens
 */
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (type) filter.type = type;

        const tokens = await ActivationToken.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ActivationToken.countDocuments(filter);

        res.json({
            success: true,
            data: {
                tokens,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get tokens error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
