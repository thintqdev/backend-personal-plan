# User-Based API Key System 👥🔐

## Overview
The API key system has been redesigned to be user-centric. Each user can now have multiple API keys, providing better security, management, and tracking capabilities.

## 🆕 **What's Changed**

### Database Schema Updates
- **API keys now belong to users** via `userId` foreign key
- **Enhanced tracking** with IP address and device information
- **User limits** - maximum 10 API keys per user
- **Better indexing** for user-specific queries

### New Features
- 👤 **User ownership** - API keys are tied to specific users
- 📊 **Enhanced usage tracking** - IP addresses and device info
- 🏷️ **User-scoped operations** - Create/manage keys per user
- 🔒 **Security improvements** - Better isolation between users

---

## 🗄️ **Database Schema**

### Updated ApiKey Model
```javascript
{
  userId: ObjectId,          // NEW: Reference to User
  name: String,
  key: String,               // Unique API key
  keyHash: String,           // SHA-256 hash
  isActive: Boolean,
  lastUsedAt: Date,
  usageCount: Number,
  lastUsedIp: String,        // NEW: Track IP usage
  deviceInfo: String,        // NEW: Track device/browser
  rateLimit: {
    requestsPerMinute: Number,
    requestsPerHour: Number,
    requestsPerDay: Number
  },
  expiresAt: Date,
  description: String,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes Added
```javascript
// Compound indexes for efficient queries
{ userId: 1, isActive: 1 }
{ userId: 1, createdAt: -1 }
{ key: 1, isActive: 1 }
{ expiresAt: 1 }
```

---

## 🚀 **API Endpoints**

### User-Specific Endpoints
```bash
GET /api/apikeys                    # Get current user's API keys
GET /api/apikeys/all                # Get all API keys (admin only)
POST /api/apikeys                   # Create API key for user
GET /api/apikeys/:id                # Get specific API key
PUT /api/apikeys/:id                # Update API key
DELETE /api/apikeys/:id             # Delete API key
POST /api/apikeys/:id/regenerate    # Regenerate API key
GET /api/apikeys/:id/usage          # Get usage statistics
```

### Request Examples

#### Create API Key for User
```bash
POST /api/apikeys
Content-Type: application/json

{
  "userId": "user_id_here",
  "name": "My App API Key",
  "description": "Key for my mobile application",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "rateLimit": {
    "requestsPerMinute": 100,
    "requestsPerHour": 2000,
    "requestsPerDay": 20000
  }
}
```

#### Get User's API Keys
```bash
GET /api/apikeys?userId=user_id_here&page=1&limit=10&isActive=true
```

---

## 🔧 **Migration Process**

### Step 1: Run Migration Script
```bash
# Migrate existing API keys to users
cd backend/src/seed
node migration_apikey_users.js migrate

# Validate migration
node migration_apikey_users.js validate
```

### Step 2: Seed New User-Based API Keys
```bash
# Clear old keys and create new user-based ones
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
const { seedApiKeys } = require('./src/seed/apiKeySeeder');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await seedApiKeys();
    mongoose.disconnect();
  })
  .catch(console.error);
"
```

---

## 👥 **User Management Integration**

### Creating API Keys for Users
```javascript
// In your application
const createUserApiKey = async (userId, keyData) => {
  const response = await fetch('/api/apikeys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      name: keyData.name,
      description: keyData.description,
      rateLimit: keyData.rateLimit
    })
  });
  
  return response.json();
};
```

### User Dashboard Integration
```javascript
// Get user's API keys for dashboard
const getUserApiKeys = async (userId) => {
  const response = await fetch(`/api/apikeys?userId=${userId}`);
  return response.json();
};
```

---

## 🔒 **Security Features**

### Enhanced Tracking
- **IP Address Logging** - Track where keys are used
- **Device Information** - Monitor browser/app usage
- **Usage Statistics** - Detailed usage per key
- **User Isolation** - Keys belong to specific users

### Rate Limiting Per User
```javascript
// Default limits per user
{
  requestsPerMinute: 100,
  requestsPerHour: 1000,
  requestsPerDay: 10000
}

// Premium user limits
{
  requestsPerMinute: 500,
  requestsPerHour: 10000,
  requestsPerDay: 100000
}
```

### User Limits
- **Maximum 10 API keys** per user
- **Automatic cleanup** of expired keys
- **User-specific rate limiting**

---

## 📊 **Enhanced Usage Tracking**

### New Tracking Data
```json
{
  "id": "api_key_id",
  "name": "My API Key",
  "usageCount": 1250,
  "lastUsedAt": "2024-01-15T10:30:00Z",
  "lastUsedIp": "192.168.1.100",
  "deviceInfo": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "createdAt": "2024-01-01T00:00:00Z",
  "isActive": true,
  "isExpired": false,
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 🛠️ **Frontend Integration**

### User API Key Management Component
```typescript
// Example React component for user API key management
const UserApiKeys = ({ userId }: { userId: string }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  
  const loadApiKeys = async () => {
    const response = await fetch(`/api/apikeys?userId=${userId}`);
    const data = await response.json();
    setApiKeys(data.apiKeys);
  };
  
  const createApiKey = async (keyData: CreateApiKeyRequest) => {
    await fetch('/api/apikeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...keyData, userId })
    });
    loadApiKeys(); // Refresh list
  };
  
  // ... component implementation
};
```

### User Profile Integration
```typescript
// Add API key management to user profile
interface UserProfile {
  user: User;
  apiKeys: ApiKey[];
  apiKeyUsage: UsageStats;
}
```

---

## 🔄 **Rollback Plan**

If needed, you can rollback to the old system:

```bash
# Rollback migration
node migration_apikey_users.js rollback

# This will remove userId from all API keys
# Making them system-wide again
```

---

## 📋 **Migration Checklist**

- [ ] **Backup database** before migration
- [ ] **Run migration script** to associate keys with users
- [ ] **Validate migration** - ensure all keys have users
- [ ] **Update frontend** to use user-specific endpoints
- [ ] **Test API key creation** for specific users
- [ ] **Verify rate limiting** works per user
- [ ] **Test usage tracking** with IP and device info
- [ ] **Update documentation** for new endpoints

---

## 🎯 **Benefits of User-Based API Keys**

1. **Better Security** - Keys are isolated per user
2. **Enhanced Tracking** - Know exactly who is using what
3. **Flexible Management** - Users can manage their own keys
4. **Scalable Architecture** - Supports multi-tenant applications
5. **Detailed Analytics** - Per-user usage statistics
6. **Compliance Ready** - Better audit trails

---

## 🆘 **Troubleshooting**

### Common Issues

1. **"User ID required" error**
   - Ensure userId is provided when creating API keys
   - Check that the user exists in the database

2. **"Maximum number of API keys reached"**
   - User has 10+ active API keys
   - Deactivate or delete unused keys

3. **Migration failed**
   - Check database connection
   - Ensure User model is properly set up
   - Verify MongoDB write permissions

### Debug Commands
```bash
# Check API key counts per user
db.apikeys.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } }
])

# Find orphaned API keys
db.apikeys.find({ userId: { $exists: false } })

# Check user associations
db.apikeys.aggregate([
  { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } }
])
```

---

🎉 **Your API key system is now user-centric and ready for production!**

Each user can now have their own set of API keys with proper tracking, rate limiting, and management capabilities.