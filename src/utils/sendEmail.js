const nodemailer = require("nodemailer");

/**
 * Gửi email đơn giản
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} html - Nội dung email dạng HTML
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, html) {
    // Cấu hình transporter (dùng mail test của ethereal hoặc cấu hình SMTP thực tế)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || "", // điền tài khoản test hoặc thực tế
            pass: process.env.SMTP_PASS || "",
        },
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@thinplan.com',
        to,
        subject,
        html,
    });
}

module.exports = sendEmail;
