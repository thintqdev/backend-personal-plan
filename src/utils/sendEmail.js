const nodemailer = require("nodemailer");

/**
 * Gửi email đơn giản với logging chi tiết
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} html - Nội dung email dạng HTML
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, html) {
    console.log(`[SendEmail] Attempting to send email to: ${to}`);
    console.log(`[SendEmail] Subject: ${subject}`);
    console.log(`[SendEmail] SMTP Config: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`[SendEmail] SMTP User: ${process.env.SMTP_USER}`);

    // Cấu hình transporter (dùng mail test của ethereal hoặc cấu hình SMTP thực tế)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || "", // điền tài khoản test hoặc thực tế
            pass: process.env.SMTP_PASS || "",
        },
        // Thêm debug để xem chi tiết
        debug: true,
        logger: true
    });

    try {
        // Verify SMTP connection trước khi gửi
        await transporter.verify();
        console.log(`[SendEmail] SMTP connection verified successfully`);

        const result = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@thinplan.com',
            to,
            subject,
            html,
        });

        console.log(`[SendEmail] ✅ Email sent successfully!`);
        console.log(`[SendEmail] Message ID: ${result.messageId}`);
        console.log(`[SendEmail] Response: ${result.response}`);

        return result;
    } catch (error) {
        console.error(`[SendEmail] ❌ Failed to send email:`);
        console.error(`[SendEmail] Error: ${error.message}`);
        console.error(`[SendEmail] Code: ${error.code}`);
        console.error(`[SendEmail] Command: ${error.command}`);
        throw error;
    }
}

module.exports = sendEmail;
