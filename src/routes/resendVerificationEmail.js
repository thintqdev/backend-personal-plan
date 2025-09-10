const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ActivationToken = require('../models/ActivationToken');
const emailQueue = require('../services/emailQueueMongoDB');
const { USER_STATUS } = require('../config/constants');

const router = express.Router();

/**
 * @swagger
 * /api/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend email verification
 *     description: Resend verification email to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email xác thực đã được gửi lại"
 *       400:
 *         description: Invalid request or user already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email không hợp lệ hoặc tài khoản đã được xác thực"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Người dùng không tồn tại"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server"
 */
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        // Check if user is already verified
        if (user.status === USER_STATUS.ACTIVE) {
            return res.status(400).json({
                success: false,
                message: 'Tài khoản đã được xác thực'
            });
        }

        // Xóa token verification cũ của user này
        await ActivationToken.deleteMany({
            userId: user._id,
            type: 'email_verification'
        });

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours

        // Tạo token mới
        await ActivationToken.create({
            userId: user._id,
            token: verificationToken,
            type: 'email_verification',
            expiredAt: tokenExpiry
        });

        // Create verification URL
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        // Send verification email
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Xác thực email của bạn</h2>
                <p>Xin chào ${user.name},</p>
                <p>Bạn đã yêu cầu gửi lại email xác thực. Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực email</a>
                </div>
                <p>Hoặc copy link sau vào trình duyệt:</p>
                <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
                <p style="color: #999; font-size: 12px;">Link này sẽ hết hạn sau 24 giờ.</p>
            </div>
        `;

        const jobId = await emailQueue.addToQueue(
            user.email,
            'Xác thực email (Gửi lại) - ThinPlan',
            emailHtml,
            { priority: 'normal' }
        );

        console.log(`Resend verification email queued for ${user.email}, Job ID: ${jobId}`);

        res.json({
            success: true,
            message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.'
        });

    } catch (error) {
        console.error('Resend verification email error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
