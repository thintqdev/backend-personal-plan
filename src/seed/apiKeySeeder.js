const ApiKey = require("../models/ApiKey");
const User = require("../models/User");

// Helper function to create API keys for users
const createApiKeysForUsers = async () => {
  try {
    // Get or create a default user for seeding
    let defaultUser = await User.findOne({ role: 'user' });
    
    if (!defaultUser) {
      // Create a default user if none exists
      defaultUser = new User({
        name: "Default User",
        role: "user",
        goal: "Manage personal data",
        streak: 0,
        avatar: "/friendly-person-avatar.png"
      });
      await defaultUser.save();
      console.log('Created default user for API keys');
    }

    // Get or create an admin user
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      adminUser = new User({
        name: "Admin User",
        role: "admin",
        goal: "System administration",
        streak: 0,
        avatar: "/friendly-person-avatar.png"
      });
      await adminUser.save();
      console.log('Created admin user for API keys');
    }

    return { defaultUser, adminUser };
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
};

const seedApiKeys = async () => {
  try {
    // Check if API keys already exist
    const existingCount = await ApiKey.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing API keys. Skipping seeding.`);
      return;
    }
    
    console.log("Seeding API keys...");
    
    // Create or get users
    const { defaultUser, adminUser } = await createApiKeysForUsers();
    
    const apiKeySeeds = [
      {
        userId: adminUser._id,
        name: "Admin Master Key",
        description: "Administrative access to all API endpoints",
        createdBy: "system",
        rateLimit: {
          requestsPerMinute: 500,
          requestsPerHour: 10000,
          requestsPerDay: 100000
        }
      },
      {
        userId: defaultUser._id,
        name: "Frontend Application Key",
        description: "Key for the frontend application",
        createdBy: "system",
        rateLimit: {
          requestsPerMinute: 200,
          requestsPerHour: 5000,
          requestsPerDay: 50000
        }
      },
      {
        userId: defaultUser._id,
        name: "Mobile App Key",
        description: "Key for mobile application",
        createdBy: "system",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        rateLimit: {
          requestsPerMinute: 150,
          requestsPerHour: 3000,
          requestsPerDay: 30000
        }
      }
    ];
    
    const createdKeys = [];
    
    for (const keyData of apiKeySeeds) {
      const apiKey = new ApiKey(keyData);
      await apiKey.save();
      
      // Populate user info
      await apiKey.populate('userId', 'name email role');
      
      // Store the key for logging (only during seeding)
      createdKeys.push({
        name: apiKey.name,
        key: apiKey.key,
        description: apiKey.description,
        user: apiKey.userId.name,
        userRole: apiKey.userId.role
      });
    }
    
    console.log(`\n✅ Seeded ${createdKeys.length} API keys successfully!\n`);
    
    // Display the keys (only during seeding for admin reference)
    console.log("📋 Created API Keys:");
    console.log("=" * 80);
    
    createdKeys.forEach((key, index) => {
      console.log(`\n${index + 1}. ${key.name}`);
      console.log(`   Key: ${key.key}`);
      console.log(`   Description: ${key.description}`);
      console.log(`   User: ${key.user} (${key.userRole})`);
    });
    
    console.log("\n" + "=" * 80);
    console.log("⚠️  IMPORTANT: Save these keys securely! They won't be shown again.");
    console.log("=" * 80 + "\n");
    
    return createdKeys;
  } catch (error) {
    console.error("Error seeding API keys:", error);
    throw error;
  }
};

// Helper function to create a new API key programmatically
const createApiKey = async (keyData) => {
  try {
    if (!keyData.userId) {
      throw new Error('userId is required for API key creation');
    }
    
    const apiKey = new ApiKey(keyData);
    await apiKey.save();
    
    // Populate user info
    await apiKey.populate('userId', 'name email role');
    
    return {
      id: apiKey._id,
      name: apiKey.name,
      key: apiKey.key, // Return actual key only during creation
      description: apiKey.description,
      user: apiKey.userId,
      createdAt: apiKey.createdAt
    };
  } catch (error) {
    console.error("Error creating API key:", error);
    throw error;
  }
};

module.exports = { 
  seedApiKeys, 
  createApiKey,
  createApiKeysForUsers 
};