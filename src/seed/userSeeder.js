const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const userData = {
  name: "Trần Quang Thìn",
  role: "Developer",
  goal: "JLPT N3",
  streak: 1,
  avatar:
    "https://jbagy.me/wp-content/uploads/2025/03/hinh-anh-avatar-anime-chibi-boy-11.jpg",
};

async function seedUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  let user = await User.findOne();
  if (!user) {
    user = new User(userData);
  } else {
    Object.assign(user, userData);
  }
  await user.save();
  console.log("User seeded:", user);
  await mongoose.disconnect();
}

seedUser();
