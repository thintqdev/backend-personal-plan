const mongoose = require('mongoose');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');

/**
 * Migration script to associate existing API keys with users
 * Run this script when transitioning from system-wide API keys to user-specific API keys
 */
const migrateApiKeysToUsers = async () => {
  try {
    console.log('🔄 Starting API key migration...');
    
    // Find API keys without userId
    const orphanedKeys = await ApiKey.find({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });
    
    if (orphanedKeys.length === 0) {
      console.log('✅ No orphaned API keys found. Migration not needed.');
      return;
    }
    
    console.log(`📋 Found ${orphanedKeys.length} API keys without user association.`);
    
    // Get or create a system user for orphaned keys
    let systemUser = await User.findOne({ role: 'admin' });
    
    if (!systemUser) {
      console.log('👤 Creating system user for orphaned API keys...');
      systemUser = new User({
        name: 'System User',
        role: 'admin',
        goal: 'System administration and API management',
        streak: 0,
        avatar: '/friendly-person-avatar.png'
      });
      await systemUser.save();
      console.log('✅ System user created.');
    }
    
    // Associate orphaned keys with system user
    const updateResult = await ApiKey.updateMany(
      { 
        $or: [
          { userId: { $exists: false } },
          { userId: null }
        ]
      },
      { 
        userId: systemUser._id,
        updatedAt: new Date()
      }
    );
    
    console.log(`✅ Migration completed! Updated ${updateResult.modifiedCount} API keys.`);
    console.log(`🔗 All orphaned API keys are now associated with: ${systemUser.name} (${systemUser._id})`);
    
    return {
      migratedCount: updateResult.modifiedCount,
      systemUserId: systemUser._id
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

/**
 * Rollback migration - removes userId from all API keys
 * WARNING: This will make all API keys system-wide again
 */
const rollbackMigration = async () => {
  try {
    console.log('🔄 Rolling back API key migration...');
    
    const updateResult = await ApiKey.updateMany(
      {},
      { 
        $unset: { userId: 1 },
        updatedAt: new Date()
      }
    );
    
    console.log(`✅ Rollback completed! Updated ${updateResult.modifiedCount} API keys.`);
    console.log('⚠️  All API keys are now system-wide (no user association).');
    
    return updateResult.modifiedCount;
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

/**
 * Validate migration - check that all API keys have valid user associations
 */
const validateMigration = async () => {
  try {
    console.log('🔍 Validating API key migration...');
    
    const totalKeys = await ApiKey.countDocuments();
    const keysWithUsers = await ApiKey.countDocuments({ 
      userId: { $exists: true, $ne: null } 
    });
    const orphanedKeys = totalKeys - keysWithUsers;
    
    console.log(`📊 Migration validation results:`);
    console.log(`   Total API keys: ${totalKeys}`);
    console.log(`   Keys with users: ${keysWithUsers}`);
    console.log(`   Orphaned keys: ${orphanedKeys}`);
    
    if (orphanedKeys === 0) {
      console.log('✅ Migration validation passed! All API keys have user associations.');
      return true;
    } else {
      console.log('❌ Migration validation failed! Some API keys are still orphaned.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  }
};

module.exports = {
  migrateApiKeysToUsers,
  rollbackMigration,
  validateMigration
};

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thinplan')
    .then(async () => {
      console.log('📱 Connected to MongoDB');
      
      switch (command) {
        case 'migrate':
          await migrateApiKeysToUsers();
          break;
        case 'rollback':
          await rollbackMigration();
          break;
        case 'validate':
          await validateMigration();
          break;
        default:
          console.log('Usage: node migration.js [migrate|rollback|validate]');
          console.log('  migrate  - Associate orphaned API keys with a system user');
          console.log('  rollback - Remove user associations from all API keys');
          console.log('  validate - Check that all API keys have user associations');
      }
      
      mongoose.disconnect();
    })
    .catch(error => {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    });
}