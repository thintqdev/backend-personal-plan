const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { USER_STATUS, USER_ROLE } = require("../config/constants");
const sendEmail = require("../utils/sendEmail");
const verifyEmailTemplate = require("../templates/verifyEmailTemplate");
const resetPasswordTemplate = require("../templates/resetPasswordTemplate");

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
            role: USER_ROLE.USER,
        });
        await user.save();
        // Gửi email xác thực
        const verifyToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email/${verifyToken}`;
        const verifyMailHtml = verifyEmailTemplate({ name: user.name, verifyUrl });
        await sendEmail(user.email, "Xác thực tài khoản ThinPlan", verifyMailHtml);
        res.status(201).json({ message: "Đăng ký thành công. Vui lòng xác thực email." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Email hoặc mật khẩu không đúng" });
        if (user.status !== USER_STATUS.ACTIVE) {
            return res.status(403).json({ error: "Tài khoản chưa được kích hoạt" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Email hoặc mật khẩu không đúng" });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        user.last_login = new Date();
        user.login_attempt = 0;
        await user.save();
        res.json({ token, user, message: "Đăng nhập thành công" });
    } catch (err) {
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
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1h
        await user.save();
        // Gửi email reset password
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
        const resetMailHtml = resetPasswordTemplate({ name: user.name, resetUrl });
        await sendEmail(user.email, "Đặt lại mật khẩu ThinPlan", resetMailHtml);
        res.json({ message: "Đã gửi email đặt lại mật khẩu" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: "Đặt lại mật khẩu thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xác thực email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        // Giải mã token, tìm user, cập nhật status và verified_email_at
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
        user.status = USER_STATUS.ACTIVE;
        user.verified_email_at = new Date();
        await user.save();
        res.json({ message: "Xác thực email thành công" });
    } catch (err) {
        res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }
};
