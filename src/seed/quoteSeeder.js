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

async function seedQuotes() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Quote.deleteMany({});
  for (const text of quotes) {
    await new Quote({ text }).save();
  }
  console.log("Quotes seeded!");
  await mongoose.disconnect();
}

seedQuotes();
