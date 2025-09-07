require("dotenv").config();
const mongoose = require("mongoose");
const FinanceJar = require("../models/FinanceJar");
const Transaction = require("../models/Transaction");

async function connectToDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
}

const financeJarsData = [
  {
    name: "Tiết kiệm dài hạn",
    description: "Dành cho việc đầu tư và tiết kiệm dài hạn",
    targetAmount: 50000000,
    currentAmount: 15000000,
    percentage: 10,
    color: "#4CAF50",
    icon: "💰",
    priority: "High",
    category: "Savings",
    isActive: true,
  },
  {
    name: "Quỹ khẩn cấp",
    description: "Tiền dự phòng cho những tình huống bất ngờ",
    targetAmount: 30000000,
    currentAmount: 8000000,
    percentage: 15,
    color: "#FF5722",
    icon: "🚨",
    priority: "High",
    category: "Emergency",
    isActive: true,
  },
  {
    name: "Giải trí",
    description: "Chi phí cho hoạt động giải trí và thư giãn",
    targetAmount: 5000000,
    currentAmount: 2500000,
    percentage: 10,
    color: "#9C27B0",
    icon: "🎉",
    priority: "Medium",
    category: "Entertainment",
    isActive: true,
  },
  {
    name: "Học tập",
    description: "Đầu tư cho việc học tập và phát triển bản thân",
    targetAmount: 10000000,
    currentAmount: 6000000,
    percentage: 5,
    color: "#3F51B5",
    icon: "📚",
    priority: "High",
    category: "Education",
    isActive: true,
  },
  {
    name: "Du lịch",
    description: "Tiết kiệm cho các chuyến du lịch",
    targetAmount: 20000000,
    currentAmount: 5000000,
    percentage: 8,
    color: "#00BCD4",
    icon: "✈️",
    priority: "Medium",
    category: "Travel",
    isActive: true,
  },
  {
    name: "Mua sắm",
    description: "Chi phí cho việc mua sắm cá nhân",
    targetAmount: 8000000,
    currentAmount: 3000000,
    percentage: 12,
    color: "#FF9800",
    icon: "🛍️",
    priority: "Low",
    category: "Shopping",
    isActive: true,
  },
];

const createTransactionsData = (jars) => {
  const transactionsData = [];
  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Education",
    "Health",
    "Other",
  ];
  const descriptions = {
    income: [
      "Lương tháng",
      "Thưởng dự án",
      "Thu nhập phụ",
      "Tiền lãi đầu tư",
      "Bán đồ cũ",
      "Freelance",
    ],
    expense: [
      "Mua đồ ăn",
      "Chi phí di chuyển",
      "Mua sắm cần thiết",
      "Thanh toán hóa đơn",
      "Xem phim",
      "Mua sách",
      "Khám bệnh",
      "Chi phí khác",
    ],
  };

  jars.forEach((jar) => {
    // Tạo 5-10 giao dịch cho mỗi jar
    const transactionCount = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < transactionCount; i++) {
      const isIncome = Math.random() > 0.6; // 40% chance for income
      const type = isIncome ? "income" : "expense";
      const amount = isIncome
        ? Math.floor(Math.random() * 5000000) + 1000000 // 1M - 6M for income
        : Math.floor(Math.random() * 2000000) + 100000; // 100K - 2.1M for expense

      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

      transactionsData.push({
        jarId: jar._id,
        amount: amount,
        type: type,
        description:
          descriptions[type][
          Math.floor(Math.random() * descriptions[type].length)
          ],
        date: randomDate,
        category: categories[Math.floor(Math.random() * categories.length)],
      });
    }
  });

  return transactionsData;
};

async function seedFinanceData(userId) {
  if (!userId) throw new Error("Thiếu userId khi seed finance");
  await connectToDatabase();
  await Transaction.deleteMany({ userId });
  await FinanceJar.deleteMany({ userId });
  const jars = await FinanceJar.insertMany(financeJarsData.map(j => ({ ...j, userId })));
  const transactionsData = createTransactionsData(jars).map(t => ({ ...t, userId }));
  await Transaction.insertMany(transactionsData);
  // ...
  for (const jar of jars) {
    // ...
  }
  // ...
  console.log("Finance seeding completed successfully!");
  await mongoose.disconnect();
}

// Chạy seeder nếu file được chạy trực tiếp
if (require.main === module) {
  require("dotenv").config();
  (async () => {
    try {
      await connectToDatabase();
      const User = require("../models/User");
      const user = await User.findOne();
      if (!user) throw new Error("Chưa có user để seed finance");
      await seedFinanceData(user._id);
    } catch (error) {
      console.error("Error running finance seeder:", error);
    }
  })();
}

module.exports = seedFinanceData;
