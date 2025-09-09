const mongoose = require("mongoose");
const Cover = require("../models/Cover");
const User = require("../models/User");

const coverSeeder = async () => {
  try {
    console.log("🌱 Seeding covers...");

    // Lấy tất cả users
    const users = await User.find({});
    if (users.length === 0) {
      console.log("❌ No users found. Please seed users first.");
      return;
    }

    // Xóa tất cả covers hiện có
    await Cover.deleteMany({});
    console.log("🗑️  Cleared existing covers");

    // Tạo covers cho một số users
    const coverData = [
      {
        userId: users[0]._id,
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
        title: "Mountain Sunrise",
        description: "A beautiful sunrise over the mountains",
        isActive: true,
      },
      {
        userId: users[0]._id,
        imageUrl:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop",
        title: "Forest Path",
        description: "A peaceful path through the forest",
        isActive: false,
      },
    ];

    // Thêm covers cho user khác nếu có
    if (users.length > 1) {
      coverData.push({
        userId: users[1]._id,
        imageUrl:
          "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=400&fit=crop",
        title: "Ocean Waves",
        description: "Calming ocean waves at sunset",
        isActive: true,
      });
    }

    // Thêm covers cho user thứ ba nếu có
    if (users.length > 2) {
      coverData.push({
        userId: users[2]._id,
        imageUrl:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop",
        title: "Starry Night",
        description: "Beautiful night sky with stars",
        isActive: true,
      });
    }

    // Insert covers
    const insertedCovers = await Cover.insertMany(coverData);
    console.log(`✅ Successfully seeded ${insertedCovers.length} covers`);

    // Log thông tin covers đã tạo
    insertedCovers.forEach((cover, index) => {
      console.log(
        `   ${index + 1}. ${cover.title} (${
          cover.isActive ? "Active" : "Inactive"
        })`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding covers:", error);
    throw error;
  }
};

module.exports = coverSeeder;

// Chạy seeder nếu file được gọi trực tiếp
if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log("📦 Connected to MongoDB");
      await coverSeeder();
      console.log("🎉 Cover seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1);
    });
}
