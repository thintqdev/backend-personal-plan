const ApiKey = require("../models/ApiKey");
const User = require("../models/User");

// GET /api/apikeys - Get user's API keys (user-specific)
exports.getUserApiKeys = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, userId } = req.query;

    // If userId is provided and user is admin, get that user's keys
    // Otherwise, get current user's keys (you'd need to implement user auth first)
    const targetUserId = userId || req.user?.id || req.query.defaultUserId;
    
    if (!targetUserId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const filter = { userId: targetUserId };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const apiKeys = await ApiKey.find(filter)
      .populate('userId', 'name email')
      .select('-keyHash') // Don't return the hash
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ApiKey.countDocuments(filter);
    
    res.json({
      apiKeys,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/apikeys/all - Get all API keys (admin only)
exports.getAllApiKeys = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, userId } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (userId) {
      filter.userId = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const apiKeys = await ApiKey.find(filter)
      .populate('userId', 'name email role')
      .select('-keyHash') // Don't return the hash
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ApiKey.countDocuments(filter);
    
    res.json({
      apiKeys,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/apikeys/:id - Get API key by ID
exports.getApiKeyById = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id)
      .populate('userId', 'name email role')
      .select('-keyHash');
    
    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }
    
    res.json(apiKey);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid API key ID" });
    }
    res.status(500).json({ error: err.message });
  }
};

// POST /api/apikeys - Create new API key for user
exports.createApiKey = async (req, res) => {
  try {
    const { 
      userId,
      name, 
      description, 
      expiresAt,
      rateLimit,
      createdBy = 'user'
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        error: "Name is required" 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required" 
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    // Check if user already has too many API keys (limit to 10 per user)
    const existingKeysCount = await ApiKey.countDocuments({ 
      userId, 
      isActive: true 
    });
    
    if (existingKeysCount >= 10) {
      return res.status(400).json({ 
        error: "Maximum number of API keys (10) reached for this user" 
      });
    }

    const apiKeyData = {
      userId,
      name,
      description,
      createdBy
    };

    // Set expiration if provided
    if (expiresAt) {
      apiKeyData.expiresAt = new Date(expiresAt);
    }

    // Set custom rate limits if provided
    if (rateLimit) {
      apiKeyData.rateLimit = rateLimit;
    }

    const apiKey = new ApiKey(apiKeyData);
    await apiKey.save();

    // Populate user info for response
    await apiKey.populate('userId', 'name email');

    // Return the API key (including the actual key) only once upon creation
    const response = apiKey.toJSON();
    response.key = apiKey.key; // Include the actual key for the user to copy
    
    res.status(201).json(response);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/apikeys/:id - Update API key
exports.updateApiKey = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      isActive, 
      expiresAt,
      rateLimit
    } = req.body;

    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Update fields (userId cannot be changed for security)
    if (name !== undefined) apiKey.name = name;
    if (description !== undefined) apiKey.description = description;
    if (isActive !== undefined) apiKey.isActive = isActive;
    if (expiresAt !== undefined) {
      apiKey.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    if (rateLimit !== undefined) apiKey.rateLimit = rateLimit;

    await apiKey.save();
    
    // Don't return the hash or actual key, but include user info
    const response = await ApiKey.findById(apiKey._id)
      .populate('userId', 'name email')
      .select('-keyHash');
    res.json(response);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid API key ID" });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/apikeys/:id - Delete API key
exports.deleteApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    await ApiKey.findByIdAndDelete(req.params.id);
    res.json({ message: "API key deleted successfully" });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid API key ID" });
    }
    res.status(500).json({ error: err.message });
  }
};

// POST /api/apikeys/:id/regenerate - Regenerate API key
exports.regenerateApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Generate new key
    const crypto = require("crypto");
    const newKey = 'tp_' + crypto.randomBytes(32).toString('hex');
    
    apiKey.key = newKey;
    apiKey.keyHash = crypto.createHash('sha256').update(newKey).digest('hex');
    apiKey.lastUsedAt = null;
    apiKey.usageCount = 0;
    apiKey.lastUsedIp = null;
    apiKey.deviceInfo = null;
    
    await apiKey.save();

    // Return with the new key (only time it's returned)
    const response = apiKey.toJSON();
    response.key = newKey;
    
    res.json(response);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid API key ID" });
    }
    res.status(500).json({ error: err.message });
  }
};

// GET /api/apikeys/:id/usage - Get usage statistics
exports.getUsageStats = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id)
      .populate('userId', 'name email')
      .select('-keyHash');
    
    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }
    
    res.json({
      id: apiKey._id,
      name: apiKey.name,
      usageCount: apiKey.usageCount,
      lastUsedAt: apiKey.lastUsedAt,
      lastUsedIp: apiKey.lastUsedIp,
      deviceInfo: apiKey.deviceInfo,
      createdAt: apiKey.createdAt,
      isActive: apiKey.isActive,
      isExpired: apiKey.isExpired(),
      user: apiKey.userId
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid API key ID" });
    }
    res.status(500).json({ error: err.message });
  }
};