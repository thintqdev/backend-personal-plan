module.exports = function resetPasswordTemplate({ name, resetUrl }) {
    return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#f9fafb;padding:32px 24px 24px 24px;border-radius:12px;box-shadow:0 2px 8px #e0e7ef;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src='https://static.vecteezy.com/system/resources/previews/008/929/795/non_2x/tp-or-pt-letter-logo-design-template-vector.jpg' alt='ThinPlan' style='height:48px;margin-bottom:8px;'>
      <h2 style="color:#4f46e5;margin:0 0 8px 0;">Đặt lại mật khẩu ThinPlan</h2>
      <p style="color:#374151;font-size:16px;margin:0;">Xin chào <b>${name || "bạn"}</b>,<br>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản ThinPlan.</p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#4f46e5;color:#fff;font-weight:bold;text-decoration:none;border-radius:6px;font-size:18px;">Đặt lại mật khẩu</a>
    </div>
    <p style="color:#6b7280;font-size:14px;text-align:center;">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    <div style="margin-top:32px;text-align:center;color:#b0b4be;font-size:13px;">© ${new Date().getFullYear()} ThinPlan. All rights reserved.</div>
  </div>
  `;
};
