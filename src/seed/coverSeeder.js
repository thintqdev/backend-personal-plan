const mongoose = require("mongoose");
const Cover = require("../models/Cover");

const sampleCovers = [
  {
    imageUrl: "/mountain-peak-sunrise-motivation-success.png",
    title: "Mountain Peak Sunrise",
    description: "Motivational sunrise over mountain peaks representing success and achievement",
    isActive: true
  },
  {
    imageUrl: "/forest-path-journey-growth-nature.jpg", 
    title: "Forest Path Journey",
    description: "Peaceful forest path symbolizing personal growth and life's journey",
    isActive: true
  },
  {
    imageUrl: "/ocean-waves-calm-meditation-balance.jpg",
    title: "Ocean Waves Calm", 
    description: "Serene ocean waves promoting meditation and inner balance",
    isActive: true
  },
  {
    imageUrl: "/city-skyline-night-ambition-goals.jpg",
    title: "City Skyline Night",
    description: "Dynamic city skyline at night representing ambition and future goals", 
    isActive: true
  },
  {
    imageUrl: "/library-books-knowledge-learning.jpg",
    title: "Library Books Knowledge",
    description: "Classic library setting inspiring continuous learning and knowledge growth",
    isActive: true
  },
  {
    imageUrl: "/workspace-desk-productivity-focus.jpg", 
    title: "Workspace Productivity",
    description: "Clean, organized workspace promoting productivity and focused work",
    isActive: true
  },
  {
    imageUrl: "/garden-flowers-growth-renewal.jpg",
    title: "Garden Flowers Growth", 
    description: "Beautiful garden with blooming flowers representing growth and renewal",
    isActive: true
  },
  {
    imageUrl: "/bridge-connection-progress-future.jpg",
    title: "Bridge Connection", 
    description: "Modern bridge symbolizing connections, progress, and moving toward the future",
    isActive: true
  }
];

/**
 * Seed cover images to the database
 */
const seedCovers = async () => {
  try {
    console.log("🎨 Starting cover seeding...");

    // Clear existing covers
    await Cover.deleteMany({});
    console.log("📁 Cleared existing covers");

    // Insert sample covers
    const insertedCovers = await Cover.insertMany(sampleCovers);
    console.log(`✅ Successfully seeded ${insertedCovers.length} covers:`);
    
    insertedCovers.forEach((cover, index) => {
      console.log(`   ${index + 1}. ${cover.title} - ${cover.imageUrl}`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("🎉 Cover seeding completed successfully!");
    console.log(`📊 Total covers: ${insertedCovers.length}`);
    console.log(`🔗 Access via: GET /api/covers`);
    console.log(`🎲 Random covers: GET /api/covers/random?limit=3`);
    console.log("=".repeat(80) + "\n");

    return insertedCovers;
  } catch (error) {
    console.error("❌ Error seeding covers:", error);
    throw error;
  }
};

/**
 * Helper function to create a new cover programmatically
 */
const createCover = async (coverData) => {
  try {
    const cover = new Cover(coverData);
    await cover.save();
    
    console.log(`✅ Created cover: ${cover.title || cover.imageUrl}`);
    return cover;
  } catch (error) {
    console.error("❌ Error creating cover:", error);
    throw error;
  }
};

/**
 * Get random covers for fallback functionality
 */
const getRandomCoverUrls = (count = 5) => {
  const shuffled = [...sampleCovers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(cover => cover.imageUrl);
};

module.exports = { 
  seedCovers, 
  createCover,
  getRandomCoverUrls,
  sampleCovers 
};