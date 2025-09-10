const User = require("../models/User");
const ActivationToken = require("../models/ActivationToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { USER_STATUS } = require("../config/constants");
const emailQueue = require("../services/emailQueueMongoDB");

// Đăng ký
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email đã tồn tại" });
        }
        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashed,
            status: USER_STATUS.INACTIVE, // Chờ xác thực email
            role: 'user',
        });
        await user.save();

        // Tạo verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours

        // Lưu token vào ActivationToken collection
        await ActivationToken.create({
            userId: user._id,
            token: verificationToken,
            type: 'email_verification',
            expiredAt: tokenExpiry
        });

        // Gửi email xác thực qua queue
        const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Xác thực email của bạn</h2>
                <p>Xin chào ${user.name},</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực email</a>
                </div>
                <p>Hoặc copy link sau vào trình duyệt:</p>
                <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
                <p style="color: #999; font-size: 12px;">Link này sẽ hết hạn sau 24 giờ.</p>
            </div>
        `;

        const emailJobId = await emailQueue.addToQueue(
            user.email,
            'Xác thực email - ThinPlan',
            emailHtml,
            { priority: 'high' }
        );
        console.log(`Email verification queued with ID: ${emailJobId}`);

        res.status(201).json({
            message: "Đăng ký thành công. Vui lòng xác thực email.",
            emailJobId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Email hoặc mật khẩu không đúng" });
        }

        // Kiểm tra trạng thái tài khoản
        if (user.status !== USER_STATUS.ACTIVE) {
            return res.status(403).json({ error: "Tài khoản chưa được kích hoạt" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Email hoặc mật khẩu không đúng" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        user.last_login = new Date();
        user.login_attempt = 0;
        await user.save();

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                avatar: user.avatar
            },
            message: "Đăng nhập thành công"
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Không tìm thấy email này" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // 1 hour

        // Xóa token reset password cũ của user này
        await ActivationToken.deleteMany({
            userId: user._id,
            type: 'password_reset'
        });

        // Tạo token mới
        await ActivationToken.create({
            userId: user._id,
            token: resetToken,
            type: 'password_reset',
            expiredAt: tokenExpiry
        });

        // Gửi email reset password qua queue
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Đặt lại mật khẩu</h2>
                <p>Xin chào ${user.name},</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Click vào nút bên dưới để đặt lại mật khẩu:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu</a>
                </div>
                <p>Hoặc copy link sau vào trình duyệt:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                <p style="color: #999; font-size: 12px;">Link này sẽ hết hạn sau 1 giờ.</p>
                <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
        `;

        const emailJobId = await emailQueue.addToQueue(
            user.email,
            'Đặt lại mật khẩu - ThinPlan',
            emailHtml,
            { priority: 'high' }
        );
        console.log(`Password reset email queued with ID: ${emailJobId}`);

        res.json({
            message: "Đã gửi email đặt lại mật khẩu",
            emailJobId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Tìm token trong ActivationToken collection
        const activationToken = await ActivationToken.findOne({
            token: token,
            type: 'password_reset',
            isUsed: false,
            expiredAt: { $gt: new Date() }
        }).populate('userId');

        if (!activationToken) {
            return res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
        }

        const user = activationToken.userId;
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        // Đánh dấu token đã sử dụng
        activationToken.isUsed = true;
        await activationToken.save();

        res.json({ message: "Đặt lại mật khẩu thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xác thực email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Tìm token trong ActivationToken collection
        const activationToken = await ActivationToken.findOne({
            token: token,
            type: 'email_verification',
            isUsed: false,
            expiredAt: { $gt: new Date() }
        }).populate('userId');

        if (!activationToken) {
            return res.status(400).json({ error: "Token xác thực không hợp lệ hoặc đã hết hạn" });
        }

        const user = activationToken.userId;

        if (user.status === USER_STATUS.ACTIVE) {
            return res.status(400).json({ error: "Tài khoản đã được xác thực" });
        }

        // Cập nhật trạng thái xác thực
        user.status = USER_STATUS.ACTIVE;
        user.verified_email_at = new Date();
        await user.save();

        // Đánh dấu token đã sử dụng
        activationToken.isUsed = true;
        await activationToken.save();

        res.json({ message: "Xác thực email thành công" });
    } catch (err) {
        console.error('Verify email error:', err);
        res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

// Lấy thông tin user hiện tại
exports.getCurrentUser = async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
