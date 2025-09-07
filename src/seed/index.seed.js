const mongoose = require("mongoose");
const userSeeder = require("./userSeeder");
const taskSeeder = require("./taskSeeder");
const goalSeeder = require("./goalSeeder");
const noteSeeder = require("./noteSeeder");
const quoteSeeder = require("./quoteSeeder");
const financeSeeder = require("./financeSeeder");
const monthlyReportSeeder = require("./monthlyReportSeeder");
// const planSeeder = require("./planSeeder"); // Đã xóa file này
// ... import các seeder khác nếu có

require("dotenv").config();

async function clearCollections() {
    const collections = [
        "tasks", "goals", "notes", "quotes", "financejars", "savingsgoals", "monthlyreports"
    ];
    for (const name of collections) {
        try {
            await mongoose.connection.collection(name).deleteMany({});
            console.log(`Cleared collection: ${name}`);
        } catch (err) {
            console.warn(`Could not clear collection ${name}:`, err.message);
        }
    }
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    // Seed user trước để lấy userId
    const user = await userSeeder(true); // Trả về user object
    // Xóa các collection cũ
    await clearCollections();
    // Seed các dữ liệu khác, truyền userId
    await Promise.all([
        taskSeeder(user._id),
        goalSeeder(user._id),
        noteSeeder(user._id),
        quoteSeeder(user._id),
        financeSeeder(user._id),
        monthlyReportSeeder(user._id),
        // planSeeder(user._id), // Đã xóa file này
        // ... các seeder khác
    ]);
    await mongoose.disconnect();
    console.log("Seed xong tất cả dữ liệu!");
}

main();
