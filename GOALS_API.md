# Goals API Documentation

## API Endpoints cho Goals với SubGoals

### 1. Goals Management

#### GET /api/goals

Lấy tất cả goals với subgoals

**Response:**

```json
[
  {
    "_id": "string",
    "title": "Học Master React & Next.js",
    "description": "Hoàn thành khóa học React advanced...",
    "category": "Programming",
    "priority": "High",
    "status": "In Progress",
    "targetDate": "2025-12-31T00:00:00.000Z",
    "subGoals": [
      {
        "_id": "string",
        "title": "Hoàn thành React Hooks Course",
        "description": "Học xong tất cả hooks...",
        "status": "Completed",
        "targetDate": "2025-09-15T00:00:00.000Z",
        "completedAt": "2025-08-20T00:00:00.000Z"
      }
    ],
    "createdAt": "2025-08-26T00:00:00.000Z",
    "updatedAt": "2025-08-26T00:00:00.000Z",
    "__v": 0
  }
]
```

#### GET /api/goals/:id

Lấy goal theo ID với tất cả subgoals

#### POST /api/goals

Tạo goal mới với subgoals

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "Low" | "Medium" | "High",
  "status": "Not Started" | "In Progress" | "Completed" | "On Hold",
  "targetDate": "2025-12-31",
  "subGoals": [
    {
      "title": "string",
      "description": "string",
      "status": "Not Started" | "In Progress" | "Completed" | "On Hold",
      "targetDate": "2025-11-15"
    }
  ]
}
```

#### PUT /api/goals/:id

Cập nhật goal và subgoals

**Request Body:** (tất cả fields optional)

```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "Low" | "Medium" | "High",
  "status": "Not Started" | "In Progress" | "Completed" | "On Hold",
  "targetDate": "2025-12-31",
  "subGoals": [
    {
      "_id": "string", // Nếu có _id thì update, không có thì tạo mới
      "title": "string",
      "description": "string",
      "status": "Completed",
      "completedAt": "2025-08-20T10:30:00Z"
    }
  ]
}
```

#### DELETE /api/goals/:id

Xóa goal và tất cả subgoals

### 2. SubGoals Management

#### POST /api/goals/:id/subgoals

Thêm subgoal vào goal

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "status": "Not Started",
  "targetDate": "2025-12-31"
}
```

#### PUT /api/goals/:goalId/subgoals/:subgoalId

Cập nhật subgoal

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "status": "Completed",
  "targetDate": "2025-12-31",
  "completedAt": "2025-08-20T10:30:00Z"
}
```

#### DELETE /api/goals/:goalId/subgoals/:subgoalId

Xóa subgoal

### 3. Filter & Stats

#### GET /api/goals/filter

Lọc goals theo điều kiện

**Query Parameters:**

- `status`: "Not Started" | "In Progress" | "Completed" | "On Hold"
- `priority`: "Low" | "Medium" | "High"
- `category`: string

**Example:**

```
GET /api/goals/filter?status=In Progress&priority=High
```

#### GET /api/goals/stats

Thống kê goals và subgoals

**Response:**

```json
{
  "totalGoals": 6,
  "completedGoals": 1,
  "inProgressGoals": 3,
  "notStartedGoals": 1,
  "onHoldGoals": 1,
  "completionRate": 17,
  "totalSubGoals": 18,
  "completedSubGoals": 4,
  "subGoalCompletionRate": 22,
  "priorityBreakdown": {
    "High": 3,
    "Medium": 2,
    "Low": 1
  }
}
```

## 🎯 Key Features:

1. **Nested SubGoals**: Mỗi goal có thể có nhiều subgoals
2. **Automatic Completion Tracking**: Khi status = "Completed", tự động set completedAt
3. **Flexible Updates**: Update partial data cho cả goal và subgoals
4. **Comprehensive Stats**: Thống kê cả goals và subgoals
5. **Filter Support**: Lọc goals theo status, priority, category
6. **Full CRUD**: Create, Read, Update, Delete cho cả goals và subgoals

## 📊 Database Structure:

```javascript
Goal {
  title: String,
  description: String,
  category: String,
  priority: Enum["Low", "Medium", "High"],
  status: Enum["Not Started", "In Progress", "Completed", "On Hold"],
  targetDate: Date,
  subGoals: [SubGoal],
  timestamps: true
}

SubGoal {
  title: String,
  description: String,
  status: Enum["Not Started", "In Progress", "Completed", "On Hold"],
  targetDate: Date,
  completedAt: Date,
  timestamps: true
}
```
