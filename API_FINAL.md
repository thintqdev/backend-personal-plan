# API Documentation - Simplified Version

## Thiết kế đơn giản theo yêu cầu

### 🎯 Concept chính:

- Tasks chỉ lưu `day` (thứ trong tuần), không lưu `date` cụ thể
- FE tự tính toán ngày và gọi API với filter `day` tương ứng
- Chỉ cần 1 API `/api/tasks?day=Thứ Hai` cho tất cả

### 1. Main Tasks API

#### GET /api/tasks?day={dayName}

Lấy tasks theo thứ trong tuần

**Required Parameter:**

- `day`: Thứ trong tuần (VD: "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật")

**Example Requests:**

```
GET /api/tasks?day=Thứ Hai     // Lấy tasks Thứ Hai
GET /api/tasks?day=Thứ Ba      // Lấy tasks Thứ Ba
GET /api/tasks?day=Chủ Nhật    // Lấy tasks Chủ Nhật
```

**Response Format:**

```json
{
  "day": "Thứ Hai",
  "tasks": [
    {
      "_id": "string",
      "time": "06:30 - 07:30",
      "task": "Thói quen buổi sáng + Podcast 🇯🇵",
      "type": "Study",
      "completed": false
    },
    {
      "_id": "string",
      "time": "08:00 - 12:00",
      "task": "Làm việc frontend",
      "type": "Work",
      "completed": false
    }
  ]
}
```

#### POST /api/tasks

Tạo task mới

**Request Body:**

```json
{
  "day": "Thứ Hai",
  "type": "Study",
  "time": "09:00 - 10:00",
  "task": "Học React"
}
```

### 2. Task Management APIs

#### PATCH /api/tasks/{id}/complete

Toggle hoàn thành task

**Request:**

```json
{ "completed": true }
```

**Response:**

```json
{
  "_id": "string",
  "completed": true,
  "completedAt": "2025-08-25T10:30:00Z"
}
```

#### GET /api/tasks/{id}/status

Lấy trạng thái task

#### PUT /api/tasks/{id}

Cập nhật task

#### DELETE /api/tasks/{id}

Xóa task

### 3. Stats API (giữ nguyên)

#### GET /api/stats

```json
{
  "todayProgress": "3/6",
  "weekProgress": 75,
  "currentStreak": 45,
  "totalTasks": 42,
  "completedTasks": 35
}
```

### 4. User Preferences API (giữ nguyên)

#### GET /api/user/preferences

#### PUT /api/user/preferences

## 🚀 Workflow FE:

1. **Hiển thị kế hoạch tuần:**

   - FE tính toán các thứ trong tuần
   - Gọi `/api/tasks?day=Thứ Hai` cho từng ngày
   - Hiển thị kết quả theo layout tuần

2. **Navigation:**

   - Previous/Next: FE tự tính toán thứ mới và gọi API tương ứng
   - Today: FE tính thứ hiện tại và gọi API

3. **Task management:**
   - Create/Update/Delete: Gọi các API tương ứng
   - Complete toggle: Sử dụng PATCH `/api/tasks/{id}/complete`

## ✅ Ưu điểm thiết kế này:

1. **Đơn giản tối đa**: Chỉ 1 API chính `/api/tasks?day=X`
2. **Linh hoạt**: FE có thể navigation tuần tùy ý
3. **Dễ cache**: Mỗi thứ có thể cache riêng biệt
4. **Logic rõ ràng**: Tasks theo template tuần, không phụ thuộc ngày cụ thể
5. **Dễ maintain**: Ít complexity, ít edge cases
