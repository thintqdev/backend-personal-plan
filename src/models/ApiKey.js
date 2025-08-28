const mongoose = require("mongoose");
const crypto = require("crypto");

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    keyHash: {
      type: String,
      required: true,
      select: false // Don't include in queries by default for security
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastUsedAt: {
      type: Date,
      default: null
    },
    usageCount: {
      type: Number,
      default: 0
    },
    rateLimit: {
      requestsPerMinute: {
        type: Number,
        default: 100
      },
      requestsPerHour: {
        type: Number,
        default: 1000
      },
      requestsPerDay: {
        type: Number,
        default: 10000
      }
    },
    expiresAt: {
      type: Date,
      default: null // null means no expiration
    },
    createdBy: {
      type: String,
      required: true,
      default: 'user'
    },
    description: {
      type: String,
      maxlength: 500
    },
    // Additional metadata
    lastUsedIp: {
      type: String,
      default: null
    },
    deviceInfo: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
apiKeySchema.index({ userId: 1, isActive: 1 });
apiKeySchema.index({ userId: 1, createdAt: -1 });
apiKeySchema.index({ key: 1, isActive: 1 });
apiKeySchema.index({ expiresAt: 1 });

// Generate API key before saving
apiKeySchema.pre('save', function(next) {
  if (this.isNew && !this.key) {
    // Generate a secure API key
    const apiKey = 'tp_' + crypto.randomBytes(32).toString('hex');
    this.key = apiKey;
    
    // Create hash of the key for secure storage
    this.keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  }
  next();
});

// Method to verify API key
apiKeySchema.methods.verifyKey = function(providedKey) {
  const hashedProvidedKey = crypto.createHash('sha256').update(providedKey).digest('hex');
  return this.keyHash === hashedProvidedKey;
};

// Method to check if key is expired
apiKeySchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to update usage stats
apiKeySchema.methods.recordUsage = function(ipAddress = null, userAgent = null) {
  this.lastUsedAt = new Date();
  this.usageCount += 1;
  if (ipAddress) this.lastUsedIp = ipAddress;
  if (userAgent) this.deviceInfo = userAgent;
  return this.save();
};

// Static method to find and verify API key with user info
apiKeySchema.statics.findAndVerify = async function(providedKey) {
  if (!providedKey) return null;
  
  const hashedKey = crypto.createHash('sha256').update(providedKey).digest('hex');
  
  const apiKey = await this.findOne({ 
    keyHash: hashedKey, 
    isActive: true 
  })
  .populate('userId', 'name email role')
  .select('+keyHash');
  
  if (!apiKey || apiKey.isExpired()) {
    return null;
  }
  
  return apiKey;
};

// Static method to get user's API keys
apiKeySchema.statics.findByUserId = async function(userId, includeInactive = false) {
  const filter = { userId };
  if (!includeInactive) {
    filter.isActive = true;
  }
  
  return this.find(filter)
    .select('-keyHash') // Don't return the hash
    .sort({ createdAt: -1 });
};

// Virtual to mask the key for display
apiKeySchema.virtual('maskedKey').get(function() {
  if (!this.key) return '';
  return this.key.substring(0, 8) + '...' + this.key.substring(this.key.length - 4);
});

// Virtual to get user info (when populated)
apiKeySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
apiKeySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("ApiKey", apiKeySchema);