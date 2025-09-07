const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function resetUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Xóa tất cả user (để test auth flow mới)
        const result = await User.deleteMany({});
        console.log(`Deleted ${result.deletedCount} users`);

        console.log('Reset completed. You can now register new users with the updated schema.');
        process.exit(0);
    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
}

// Chạy reset
resetUsers();
