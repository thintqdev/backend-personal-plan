const mongoose = require('mongoose');
const User = require('../models/User');

const authUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123', // This will be hashed by the User model pre-save middleware
    goal: 'Learn new programming skills and build amazing projects',
    streak: 25,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    income: 15000000, // 15 million VND
    isEmailVerified: true,
    isActive: true,
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    preferences: {
      theme: 'blue',
      coverImage: null,
      notifications: true,
      language: 'en',
    },
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'securepass123', // This will be hashed by the User model pre-save middleware
    goal: 'Achieve work-life balance and financial independence',
    streak: 15,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    income: 20000000, // 20 million VND
    isEmailVerified: true,
    isActive: true,
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    preferences: {
      theme: 'green',
      coverImage: null,
      notifications: false,
      language: 'vi',
    },
  },
  {
    name: 'Test User Unverified',
    email: 'test@example.com',
    password: 'testpass123', // This will be hashed by the User model pre-save middleware
    goal: 'Test the email verification process',
    streak: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    income: 10000000, // 10 million VND
    isEmailVerified: false,
    emailVerificationToken: 'test-verification-token-123',
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    isActive: true,
    preferences: {
      theme: 'violet',
      coverImage: null,
      notifications: true,
      language: 'vi',
    },
  },
  {
    name: 'Inactive User',
    email: 'inactive@example.com',
    password: 'inactive123', // This will be hashed by the User model pre-save middleware
    goal: 'This account is inactive for testing purposes',
    streak: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inactive',
    income: 8000000, // 8 million VND
    isEmailVerified: true,
    isActive: false, // Inactive account for testing
    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    preferences: {
      theme: 'red',
      coverImage: null,
      notifications: false,
      language: 'en',
    },
  },
];

const seedAuthUsers = async () => {
  try {
    console.log('🌱 Starting authentication user seeding...');
    
    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // console.log('🗑️ Cleared existing users');
    
    // Check if users already exist
    const existingUsers = await User.find({ email: { $in: authUsers.map(u => u.email) } });
    const existingEmails = existingUsers.map(u => u.email);
    
    // Filter out users that already exist
    const newUsers = authUsers.filter(user => !existingEmails.includes(user.email));
    
    if (newUsers.length === 0) {
      console.log('✅ All authentication users already exist');
      return;
    }
    
    // Insert new users
    const insertedUsers = await User.insertMany(newUsers);
    console.log(`✅ Inserted ${insertedUsers.length} new authentication users:`);
    
    insertedUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Verified: ${user.isEmailVerified}, Active: ${user.isActive}`);
    });
    
    // Update existing users if needed (uncomment if you want to update existing data)
    /*
    for (const userData of authUsers) {
      const existingUser = existingUsers.find(u => u.email === userData.email);
      if (existingUser) {
        // Update fields (except password to avoid re-hashing)
        const { password, ...updateData } = userData;
        await User.findByIdAndUpdate(existingUser._id, updateData);
        console.log(`🔄 Updated existing user: ${existingUser.name}`);
      }
    }
    */
    
    console.log('🎉 Authentication user seeding completed successfully!');
    console.log('\n📧 Test accounts created:');
    console.log('   User: john@example.com / password123');
    console.log('   User: jane@example.com / securepass123');
    console.log('   Unverified: test@example.com / testpass123');
    console.log('   Inactive: inactive@example.com / inactive123');
    console.log('\n✨ Note: All users have full access to their personal plan!');
    
    
  } catch (error) {
    console.error('❌ Error seeding authentication users:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  const connectDB = async () => {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personalplan';
      await mongoose.connect(mongoURI);
      console.log('📡 Connected to MongoDB');
      
      await seedAuthUsers();
      
      console.log('🔌 Disconnecting from MongoDB');
      await mongoose.disconnect();
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  };
  
  connectDB();
}

module.exports = { seedAuthUsers, authUsers };