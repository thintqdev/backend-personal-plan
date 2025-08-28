# User-Centric Authentication System Guide

## Overview

This document provides a comprehensive guide to the user-centric authentication system implemented for the ThinPlan application. The system is designed where every user has full access to their own personal plan without role-based restrictions. Each user is essentially both an admin and user of their own data.

## Features Implemented

### 🔐 Core Authentication Features
- **User Registration** with email validation
- **User Login** with password verification
- **JWT Token-based Authentication**
- **Email Verification** system
- **Password Reset** functionality
- **Change Password** for authenticated users
- **Account Security** (login attempts, account locking)
- **User-Centric Access** (each user manages their own plan)

### 🛡️ Security Features
- **Password Hashing** using bcryptjs with salt rounds
- **Account Locking** after 5 failed login attempts (2-hour lock)
- **Token Expiration** (7 days default)
- **Email Verification** required for account activation
- **Password Reset Tokens** (1-hour expiration)
- **Input Validation** and sanitization
- **Secure Password Requirements** (minimum 6 characters)

## API Endpoints

### Authentication Endpoints (`/api/auth`)

#### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": false
  },
  "emailVerificationToken": "verification_token_for_testing"
}
```

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true,
    "lastLogin": "2024-08-28T07:12:47.499Z"
  }
}
```

#### 3. Email Verification
```http
GET /api/auth/verify-email/{verification_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### 4. Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 5. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 6. Reset Password
```http
POST /api/auth/reset-password/{reset_token}
Content-Type: application/json

{
  "password": "newsecurepassword123"
}
```

#### 7. Change Password (Protected)
```http
POST /api/auth/change-password
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "currentPassword": "currentsecurepassword123",
  "newPassword": "newsecurepassword123"
}
```

#### 8. Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer {jwt_token}
```

#### 9. Update Profile (Protected)
```http
PUT /api/auth/profile
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "avatar": "https://example.com/avatar.jpg",
  "goal": "Learn new skills",
  "preferences": {
    "theme": "dark",
    "coverImage": "https://example.com/cover.jpg",
    "notifications": false,
    "language": "en"
  }
}
```

## Authentication Methods

The system supports multiple authentication methods for user convenience:

### 1. JWT Authentication (Primary)
- **Header:** `Authorization: Bearer {token}`
- **Header:** `X-Auth-Token: {token}`
- **Query:** `?token={token}`

### 2. API Key Authentication (Fallback)
- **Header:** `Authorization: Bearer {api_key}`
- **Header:** `X-API-Key: {api_key}`
- **Query:** `?api_key={api_key}`

**Note:** Each user has full access to their own personal plan and data. There are no role-based restrictions.

## Database Schema

### User Model Fields

#### Authentication Fields
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  
  // Email Verification
  isEmailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Security
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  isActive: Boolean (default: true),
  
  // Application Data
  goal: String,
  streak: Number (default: 0),
  avatar: String,
  income: Number (default: 0),
  preferences: {
    theme: String (default: 'violet'),
    coverImage: String,
    notifications: Boolean (default: true),
    language: String (default: 'vi')
  }
}
```

## Test Accounts

The system includes pre-seeded test accounts for development and testing:

| Email | Password | Status | Purpose |
|-------|----------|--------|----------|
| john@example.com | password123 | Verified, Active | User testing |
| jane@example.com | securepass123 | Verified, Active | User testing |
| test@example.com | testpass123 | Unverified, Active | Email verification testing |
| inactive@example.com | inactive123 | Verified, Inactive | Account status testing |

**Note:** All users have equal access to their personal plan - there are no admin vs user distinctions.

## Usage Examples

### 1. User Registration Flow
```bash
# Register new user
curl -X POST "http://localhost:3003/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"newuser@example.com","password":"password123"}'

# Verify email (use token from registration response)
curl -X GET "http://localhost:3003/api/auth/verify-email/{verification_token}"
```

### 2. Login and Access Protected Resources
```bash
# Login
RESPONSE=$(curl -X POST "http://localhost:3003/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}')

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.token')

# Access protected resource
curl -X GET "http://localhost:3003/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Password Reset Flow
```bash
# Request password reset
curl -X POST "http://localhost:3003/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'

# Reset password (use token from email/response)
curl -X POST "http://localhost:3003/api/auth/reset-password/{reset_token}" \
  -H "Content-Type: application/json" \
  -d '{"password":"newpassword123"}'
```

## Error Handling

The system provides detailed error responses:

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Email verification required. Please verify your email address."
}
```

#### 423 Locked
```json
{
  "success": false,
  "message": "Account is temporarily locked due to too many failed login attempts. Please try again later."
}
```

## Security Best Practices

### Implemented Security Measures
1. **Password Hashing:** All passwords are hashed using bcryptjs with 12 salt rounds
2. **Account Locking:** Accounts are locked after 5 failed login attempts for 2 hours
3. **Token Expiration:** JWT tokens expire after 7 days (configurable)
4. **Email Verification:** Required for account activation
5. **Password Reset Tokens:** Short-lived (1 hour) for security
6. **Input Validation:** All inputs are validated and sanitized
7. **Rate Limiting:** Can be implemented using existing API key rate limiting
8. **CORS Protection:** Configured in the application

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/thinplan

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (for production)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@thinplan.com

# Application
APP_NAME=ThinPlan
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
```

## Running the Authentication System

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Test Users
```bash
node src/seed/authUserSeeder.js
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access API Documentation
Visit: `http://localhost:3003/api-docs`

## Swagger Documentation

The authentication system is fully documented with Swagger. Access the interactive API documentation at:
`http://localhost:3003/api-docs`

## Middleware Integration

The system provides flexible middleware for different authentication requirements:

### Available Middleware
- `authenticateJWT`: Requires valid JWT token
- `optionalJWT`: Optional JWT authentication
- `requireEmailVerification`: Requires verified email

### Combined Authentication
The system supports both JWT and API key authentication for backward compatibility through combined middleware in user routes.

**Note:** Role-based middleware has been removed as all users have equal access to their personal plans.

## Conclusion

The user-centric authentication system is now fully implemented and tested with:
- ✅ User registration and login
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ JWT-based authentication
- ✅ Security features (account locking, password hashing)
- ✅ User-centric access control (each user manages their own plan)
- ✅ Comprehensive API documentation
- ✅ Test accounts and seeded data
- ✅ Backward compatibility with existing API key system

The system is production-ready and designed for personal planning where each user has full control over their own data and plan without role restrictions.