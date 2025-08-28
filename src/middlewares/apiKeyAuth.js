const ApiKey = require("../models/ApiKey");

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

// Clean up old rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > oneHour) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Extract API key from request
const extractApiKey = (req) => {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check X-API-Key header
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    return apiKeyHeader;
  }
  
  // Check query parameter (less secure, but sometimes needed)
  const apiKeyQuery = req.query.api_key;
  if (apiKeyQuery) {
    return apiKeyQuery;
  }
  
  return null;
};

// Check rate limits
const checkRateLimit = (apiKey, keyRecord) => {
  const now = Date.now();
  const keyId = keyRecord._id.toString();
  
  let rateLimitData = rateLimitStore.get(keyId);
  
  if (!rateLimitData) {
    rateLimitData = {
      windowStart: now,
      requests: {
        minute: 0,
        hour: 0,
        day: 0
      },
      lastMinute: now,
      lastHour: now,
      lastDay: now
    };
    rateLimitStore.set(keyId, rateLimitData);
  }
  
  // Reset counters based on time windows
  const minuteWindow = 60 * 1000; // 1 minute
  const hourWindow = 60 * 60 * 1000; // 1 hour
  const dayWindow = 24 * 60 * 60 * 1000; // 1 day
  
  if (now - rateLimitData.lastMinute > minuteWindow) {
    rateLimitData.requests.minute = 0;
    rateLimitData.lastMinute = now;
  }
  
  if (now - rateLimitData.lastHour > hourWindow) {
    rateLimitData.requests.hour = 0;
    rateLimitData.lastHour = now;
  }
  
  if (now - rateLimitData.lastDay > dayWindow) {
    rateLimitData.requests.day = 0;
    rateLimitData.lastDay = now;
  }
  
  // Check limits
  const limits = keyRecord.rateLimit;
  
  if (rateLimitData.requests.minute >= limits.requestsPerMinute) {
    return { allowed: false, reason: 'Rate limit exceeded: requests per minute' };
  }
  
  if (rateLimitData.requests.hour >= limits.requestsPerHour) {
    return { allowed: false, reason: 'Rate limit exceeded: requests per hour' };
  }
  
  if (rateLimitData.requests.day >= limits.requestsPerDay) {
    return { allowed: false, reason: 'Rate limit exceeded: requests per day' };
  }
  
  // Increment counters
  rateLimitData.requests.minute++;
  rateLimitData.requests.hour++;
  rateLimitData.requests.day++;
  
  return { allowed: true };
};

// Main authentication middleware - simple version without permissions
const authenticateApiKey = async (req, res, next) => {
  try {
    const providedKey = extractApiKey(req);
    
    if (!providedKey) {
      return res.status(401).json({ 
        error: 'API key required. Provide key in Authorization header (Bearer), X-API-Key header, or api_key query parameter.' 
      });
    }
    
    // Find and verify the API key
    const apiKeyRecord = await ApiKey.findAndVerify(providedKey);
    
    if (!apiKeyRecord) {
      return res.status(401).json({ 
        error: 'Invalid or expired API key' 
      });
    }
    
    // Check rate limits
    const rateLimitResult = checkRateLimit(providedKey, apiKeyRecord);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({ 
        error: rateLimitResult.reason 
      });
    }
    
    // Record usage (async, don't wait)
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    
    apiKeyRecord.recordUsage(ipAddress, userAgent).catch(err => {
      console.error('Failed to record API key usage:', err);
    });
    
    // Attach basic API key info to request
    req.apiKey = {
      id: apiKeyRecord._id,
      name: apiKeyRecord.name,
      userId: apiKeyRecord.userId,
      user: apiKeyRecord.userId // populated user info
    };
    
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal authentication error' 
    });
  }
};

// Optional authentication middleware (allows both authenticated and unauthenticated requests)
const optionalApiKey = async (req, res, next) => {
  try {
    const providedKey = extractApiKey(req);
    
    if (providedKey) {
      const apiKeyRecord = await ApiKey.findAndVerify(providedKey);
      
      if (apiKeyRecord) {
        // Check rate limits for authenticated requests
        const rateLimitResult = checkRateLimit(providedKey, apiKeyRecord);
        if (!rateLimitResult.allowed) {
          return res.status(429).json({ 
            error: rateLimitResult.reason 
          });
        }
        
        // Record usage
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const userAgent = req.headers['user-agent'];
        
        apiKeyRecord.recordUsage(ipAddress, userAgent).catch(err => {
          console.error('Failed to record API key usage:', err);
        });
        
        // Attach API key info
        req.apiKey = {
          id: apiKeyRecord._id,
          name: apiKeyRecord.name,
          userId: apiKeyRecord.userId,
          user: apiKeyRecord.userId
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional API key authentication error:', error);
    // Don't fail the request, just continue without authentication
    next();
  }
};

module.exports = {
  authenticateApiKey,
  optionalApiKey,
  extractApiKey
};