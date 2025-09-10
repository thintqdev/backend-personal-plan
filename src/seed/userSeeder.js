const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const userData = {
  name: "Trần Quang Thìn",
  email: "thintq@thinplan.com",
  password: "$2a$12$1mDGM8VxePsNCwr.E3.8SuCi.sLqi.l2kqV5amwKkB1NeQlakD.Bi", // 123123
  role: "Developer",
  goal: "JLPT N3",
  streak: 1,
  income: 16000000,
  avatar:
    "https://jbagy.me/wp-content/uploads/2025/03/hinh-anh-avatar-anime-chibi-boy-11.jpg",
  status: 1,
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
