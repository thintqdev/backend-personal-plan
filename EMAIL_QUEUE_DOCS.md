# Email Queue System - ThinPlan

## Tổng quan

Hệ thống email queue được thiết kế để gửi email một cách đáng tin cậy với các tính năng:

- **Queue-based processing**: Email được xử lý qua hàng đợi thay vì gửi trực tiếp
- **Priority handling**: Hỗ trợ 3 mức độ ưu tiên (high, normal, low)
- **Retry mechanism**: Tự động thử lại khi gửi email thất bại
- **Comprehensive logging**: Ghi log chi tiết trước và sau khi gửi email
- **Persistence**: Lưu trữ queue trên file system để khôi phục sau khi restart
- **Admin monitoring**: API để theo dõi và quản lý email queue

## Cấu trúc hệ thống

### 1. EmailQueue Service (`/src/services/emailQueue.js`)

Core service xử lý hàng đợi email với các tính năng:

- **Queue Management**: Thêm, xử lý, và theo dõi email jobs
- **Retry Logic**: Tự động retry với exponential backoff
- **Persistence**: Lưu queue vào file JSON để khôi phục
- **Logging**: Ghi log chi tiết vào file

### 2. EmailService (`/src/services/emailService.js`)

Wrapper service cung cấp interface đơn giản:

```javascript
// Gửi email ưu tiên cao (ngay lập tức)
await emailService.sendImmediate(to, subject, html);

// Gửi email bình thường
await emailService.send(to, subject, html);

// Gửi email ưu tiên thấp
await emailService.sendLowPriority(to, subject, html);

// Gửi email có delay
await emailService.sendDelayed(to, subject, html, delayMs);

// Gửi email verification
await emailService.sendVerificationEmail(email, name, verifyUrl);

// Gửi email reset password
await emailService.sendPasswordResetEmail(email, name, resetUrl);
```

### 3. Admin Routes (`/src/routes/emailAdmin.js`)

API endpoints để monitoring và quản lý:

```
GET /api/admin/email/stats          - Thống kê queue
GET /api/admin/email/job/:jobId     - Chi tiết job
GET /api/admin/email/logs           - Email logs
POST /api/admin/email/cleanup       - Dọn dẹp job cũ
POST /api/admin/email/test          - Gửi test email
```

## Cách sử dụng

### 1. Gửi email cơ bản

```javascript
const emailService = require("../services/emailService");

// Gửi email đăng ký
const jobId = await emailService.sendVerificationEmail(
  user.email,
  user.name,
  verifyUrl
);

console.log(`Email queued with ID: ${jobId}`);
```

### 2. Theo dõi trạng thái email

```javascript
// Kiểm tra trạng thái job
const job = emailService.getJobStatus(jobId);
console.log(`Job status: ${job.status}`);
// Trạng thái: pending, processing, completed, failed
```

### 3. Monitoring qua API

```bash
# Xem thống kê queue
curl http://localhost:3000/api/admin/email/stats

# Xem logs gần đây
curl http://localhost:3000/api/admin/email/logs?lines=50

# Gửi test email
curl -X POST http://localhost:3000/api/admin/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "priority": "high"}'
```

## File Structure

```
backend/src/
├── services/
│   ├── emailQueue.js       # Core queue service
│   └── emailService.js     # Simple interface
├── routes/
│   └── emailAdmin.js       # Admin API routes
├── data/
│   └── email-queue.json    # Queue persistence (auto-created)
└── logs/
    └── email-logs.txt      # Email activity logs (auto-created)
```

## Configuration

### Environment Variables

```env
# SMTP Configuration (đã có sẵn)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=no-reply@thinplan.com
```

### Queue Settings

Có thể tùy chỉnh trong `emailQueue.js`:

```javascript
this.retryLimit = 3; // Số lần retry tối đa
this.retryDelay = 5000; // Delay giữa các retry (ms)
```

## Logging

### Log Format

```
[2024-01-15T10:30:00.000Z] [INFO] Email queued: email_1705312200000_abc123 | To: user@example.com | Subject: Welcome
[2024-01-15T10:30:01.000Z] [INFO] Processing email: email_1705312200000_abc123 | Attempt: 1/3 | To: user@example.com
[2024-01-15T10:30:02.000Z] [SUCCESS] Email sent successfully: email_1705312200000_abc123 | To: user@example.com | Subject: Welcome
```

### Log Levels

- `INFO`: Thông tin chung (queue, processing)
- `SUCCESS`: Email gửi thành công
- `ERROR`: Lỗi gửi email hoặc system error

## Job Status

### Job States

1. **pending**: Đang chờ xử lý
2. **processing**: Đang gửi email
3. **completed**: Gửi thành công
4. **failed**: Gửi thất bại sau khi hết retry

### Job Object Structure

```javascript
{
  id: "email_1705312200000_abc123",
  to: "user@example.com",
  subject: "Welcome to ThinPlan",
  html: "<html>...</html>",
  priority: "high",           // high, normal, low
  delay: 0,                   // delay in ms
  attempts: 1,
  maxAttempts: 3,
  createdAt: "2024-01-15T10:30:00.000Z",
  scheduledAt: "2024-01-15T10:30:00.000Z",
  lastAttemptAt: "2024-01-15T10:30:01.000Z",
  completedAt: "2024-01-15T10:30:02.000Z",
  status: "completed"
}
```

## Cron Jobs

### Email Cleanup

Tự động dọn dẹp email jobs cũ:

- **Schedule**: Chủ nhật hàng tuần lúc 2:00 AM
- **Retention**: Giữ jobs trong 7 ngày
- **Location**: `src/services/cronService.js`

## API Documentation

### GET /api/admin/email/stats

Trả về thống kê queue:

```json
{
  "total": 150,
  "pending": 5,
  "processing": 1,
  "completed": 140,
  "failed": 4
}
```

### GET /api/admin/email/job/:jobId

Trả về chi tiết job:

```json
{
  "id": "email_1705312200000_abc123",
  "to": "user@example.com",
  "subject": "Welcome",
  "status": "completed",
  "attempts": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "completedAt": "2024-01-15T10:30:02.000Z"
}
```

### POST /api/admin/email/test

Gửi test email:

```json
{
  "to": "test@example.com",
  "priority": "normal",
  "delay": 0
}
```

## Migration từ hệ thống cũ

### Before (Direct Send)

```javascript
const sendEmail = require("../utils/sendEmail");
await sendEmail(user.email, subject, html);
```

### After (Queue-based)

```javascript
const emailService = require("../services/emailService");
const jobId = await emailService.send(user.email, subject, html);
```

## Best Practices

1. **Error Handling**: Luôn handle response từ email service
2. **Monitoring**: Thường xuyên check queue stats
3. **Cleanup**: Để cron job tự động cleanup hoặc manual cleanup
4. **Testing**: Sử dụng test endpoint để verify cấu hình SMTP

## Troubleshooting

### Queue không xử lý

1. Check MongoDB connection
2. Check email service initialization trong app.js
3. Check SMTP configuration

### Email không gửi được

1. Check SMTP credentials
2. Check email logs: `GET /api/admin/email/logs`
3. Check job status: `GET /api/admin/email/job/:jobId`

### Performance issues

1. Monitor queue stats
2. Adjust retry settings nếu cần
3. Cleanup old jobs thường xuyên hơn
