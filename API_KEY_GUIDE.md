# API Key Security System 🔐

## Overview
This API key system provides secure authentication and authorization for your ThinPlan API endpoints. It includes rate limiting, permission-based access control, and comprehensive usage tracking.

## 🚀 Quick Start

### 1. Seed Initial API Keys
```bash
# In your backend directory
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

### 2. Using API Keys

#### Option 1: Authorization Header (Recommended)
```javascript
fetch('http://localhost:3000/api/covers', {
  headers: {
    'Authorization': 'Bearer tp_your_api_key_here'
  }
});
```

#### Option 2: X-API-Key Header
```javascript
fetch('http://localhost:3000/api/covers', {
  headers: {
    'X-API-Key': 'tp_your_api_key_here'
  }
});
```

#### Option 3: Query Parameter (Less Secure)
```javascript
fetch('http://localhost:3000/api/covers?api_key=tp_your_api_key_here');
```

## 🔑 API Key Features

### Security Features
- **Secure Key Generation**: 64-character cryptographically secure keys
- **Hashed Storage**: Keys are hashed using SHA-256 before storage
- **Automatic Expiration**: Optional expiration dates
- **Rate Limiting**: Per-minute, per-hour, and per-day limits
- **Permission System**: Granular access control

### Permission Types
- `read:covers` - Read cover images
- `write:covers` - Create/update/delete covers
- `read:quotes` - Read quotes
- `write:quotes` - Create/update/delete quotes
- `read:users` - Read user data
- `write:users` - Create/update/delete users
- `read:goals` - Read goals
- `write:goals` - Create/update/delete goals
- `read:tasks` - Read tasks
- `write:tasks` - Create/update/delete tasks
- `read:notes` - Read notes
- `write:notes` - Create/update/delete notes
- `read:finance` - Read financial data
- `write:finance` - Create/update/delete financial records
- `admin:all` - Full administrative access

## 📊 Default API Keys Created

After seeding, you'll get 5 pre-configured API keys:

1. **Admin Master Key** (`admin:all`)
   - Full access to all endpoints
   - High rate limits (500/min, 10K/hour, 100K/day)

2. **Frontend Application Key**
   - Read/write access to user data
   - Moderate rate limits (200/min, 5K/hour, 50K/day)

3. **Read-Only Integration Key**
   - Read-only access for reporting
   - Lower rate limits (100/min, 2K/hour, 20K/day)

4. **Content Management Key**
   - Covers and quotes management only
   - Limited rate limits (50/min, 1K/hour, 10K/day)

5. **Mobile App Key**
   - Limited permissions for mobile app
   - Expires in 1 year
   - Moderate rate limits (150/min, 3K/hour, 30K/day)

## 🛠️ API Key Management

### Create New API Key
```bash
POST /api/apikeys
Content-Type: application/json

{
  "name": "My App Key",
  "permissions": ["read:covers", "write:covers"],
  "description": "Key for my application",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "rateLimit": {
    "requestsPerMinute": 100,
    "requestsPerHour": 2000,
    "requestsPerDay": 20000
  }
}
```

### List API Keys
```bash
GET /api/apikeys?page=1&limit=10&isActive=true
```

### Update API Key
```bash
PUT /api/apikeys/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false
}
```

### Regenerate API Key
```bash
POST /api/apikeys/{id}/regenerate
```

### Delete API Key
```bash
DELETE /api/apikeys/{id}
```

### Get Usage Statistics
```bash
GET /api/apikeys/{id}/usage
```

## 🔒 Protecting Your Routes

### Example: Protecting Cover Routes
```javascript
const { authenticateApiKey, requirePermission, optionalApiKey } = require("../middlewares/apiKeyAuth");

// Public read access (optional auth for higher rate limits)
router.get("/covers", optionalApiKey, coverController.getAllCovers);

// Require authentication and specific permission
router.post("/covers", authenticateApiKey, requirePermission('write:covers'), coverController.createCover);

// Admin only
router.delete("/covers/:id", authenticateApiKey, requirePermission('admin:all'), coverController.deleteCover);
```

### Middleware Options

#### `authenticateApiKey`
- Requires valid API key
- Blocks request if no key or invalid key
- Enforces rate limits

#### `requirePermission(permission)`
- Must be used after `authenticateApiKey`
- Checks if API key has specific permission
- Returns 403 if permission missing

#### `optionalApiKey`
- Allows both authenticated and unauthenticated requests
- Provides higher rate limits for authenticated users
- Good for public endpoints that benefit from authentication

## 📈 Rate Limiting

### Default Limits
- **Requests per minute**: 100
- **Requests per hour**: 1,000
- **Requests per day**: 10,000

### Custom Limits
Set custom limits when creating API keys:
```json
{
  "rateLimit": {
    "requestsPerMinute": 500,
    "requestsPerHour": 10000,
    "requestsPerDay": 100000
  }
}
```

### Rate Limit Headers
Responses include rate limit information:
```
X-RateLimit-Remaining-Minute: 95
X-RateLimit-Remaining-Hour: 995
X-RateLimit-Remaining-Day: 9995
```

## 🔍 Usage Tracking

Each API key tracks:
- **Total usage count**
- **Last used timestamp**
- **Rate limit status**
- **Permission usage patterns**

Access usage data via:
```bash
GET /api/apikeys/{id}/usage
```

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "error": "API key required. Provide key in Authorization header (Bearer), X-API-Key header, or api_key query parameter."
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions. Required: write:covers"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded: requests per minute"
}
```

## 🔧 Frontend Integration

### Update Your Frontend Service
```typescript
// lib/types.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "your_frontend_api_key_here";

// lib/cover-service.ts
export async function getCovers(page: number = 1, limit: number = 10): Promise<CoverListResponse> {
  const response = await fetch(
    `${API_URL}/api/covers?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch covers');
  }
  
  return response.json();
}
```

### Environment Variables
Add to your `.env.local`:
```
NEXT_PUBLIC_API_KEY=tp_your_frontend_api_key_here
```

## 🛡️ Security Best Practices

1. **Never expose API keys in client-side code** (except for frontend app keys)
2. **Use environment variables** for storing keys
3. **Rotate keys regularly** using the regenerate endpoint
4. **Monitor usage** via the usage statistics endpoint
5. **Use least privilege principle** - grant only necessary permissions
6. **Set expiration dates** for temporary access
7. **Disable unused keys** instead of deleting them for audit trail

## 📝 Migration Guide

### Existing Routes
To protect existing routes, add the middleware:

```javascript
// Before
router.get("/data", controller.getData);

// After
router.get("/data", authenticateApiKey, requirePermission('read:data'), controller.getData);

// Or for optional auth
router.get("/data", optionalApiKey, controller.getData);
```

### Gradual Migration
1. Start with `optionalApiKey` on public endpoints
2. Move to `authenticateApiKey` for sensitive operations
3. Add specific permissions with `requirePermission`
4. Monitor usage and adjust rate limits

## 🆘 Troubleshooting

### Common Issues

1. **"API key required" error**
   - Check if key is provided in correct header/parameter
   - Verify key format (should start with 'tp_')

2. **"Invalid or expired API key" error**
   - Check if key exists in database
   - Verify key hasn't expired
   - Ensure key is active

3. **"Rate limit exceeded" error**
   - Wait for rate limit window to reset
   - Request higher limits if needed
   - Use different API key with higher limits

4. **"Insufficient permissions" error**
   - Check required permission for endpoint
   - Verify API key has the required permission
   - Use key with 'admin:all' for testing

### Debug Mode
Enable API key debugging by setting environment variable:
```bash
DEBUG_API_KEYS=true
```

This will log detailed information about API key authentication.

---

🎉 **Your API is now secured!** All API keys are generated and ready to use. Check the console output from the seeding script to get your initial API keys.