const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const userData = {
  name: "Trần Quang Thìn",
  email: "admin@thinplan.com",
  password: "123456", // Sẽ được hash tự động bởi pre-save hook
  role: "Developer",
  goal: "JLPT N3",
  streak: 1,
  income: 16000000, // 15 triệu VND
  avatar:
    "https://jbagy.me/wp-content/uploads/2025/03/hinh-anh-avatar-anime-chibi-boy-11.jpg",
  status: "active",
  verified_email_at: new Date(),
};

async function seedUser(isImport = false) {
  if (!isImport) await mongoose.connect(process.env.MONGODB_URI);
  let user = await User.findOne();
  if (!user) {
    user = new User(userData);
  } else {
    Object.assign(user, userData);
  }
  await user.save();
  console.log("User seeded:", user);
  if (!isImport) await mongoose.disconnect();
  return user;
}

if (require.main === module) {
  seedUser();
}
module.exports = seedUser;
