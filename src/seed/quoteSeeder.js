const mongoose = require("mongoose");
const Quote = require("../models/Quote");
require("dotenv").config();

const quotes = [
  "Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc là chìa khóa của thành công.",
  "Đừng chờ đợi cơ hội, hãy tạo ra nó.",
  "Mỗi ngày là một cơ hội mới để trở thành phiên bản tốt hơn của chính mình.",
  "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.",
  "Hành trình ngàn dặm bắt đầu từ một bước chân.",
];

async function seedQuotes(userId) {
  if (!userId) throw new Error("Thiếu userId khi seed quotes");
  const quotesWithUser = quotes.map(text => ({ text, userId }));
  await Quote.deleteMany({ userId });
  await Quote.insertMany(quotesWithUser);
  console.log("Quotes seeded!");
}

if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require("../models/User");
    const user = await User.findOne();
    if (!user) throw new Error("Chưa có user để seed quotes");
    await seedQuotes(user._id);
    await mongoose.disconnect();
  });
}
module.exports = seedQuotes;
