require("dotenv").config();
const mongoose = require("mongoose");
const FinanceJar = require("../models/FinanceJar");
const Transaction = require("../models/Transaction");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

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

const seedFinanceData = async () => {
  try {
    // Xóa dữ liệu cũ
    await FinanceJar.deleteMany({});
    await Transaction.deleteMany({});
    console.log("Cleared existing finance data");

    // Tạo finance jars
    const createdJars = await FinanceJar.insertMany(financeJarsData);
    console.log(`Created ${createdJars.length} finance jars`);

    // Tạo transactions
    const transactionsData = createTransactionsData(createdJars);
    const createdTransactions = await Transaction.insertMany(transactionsData);
    console.log(`Created ${createdTransactions.length} transactions`);

    // Cập nhật currentAmount cho các jars dựa trên transactions
    for (const jar of createdJars) {
      const transactions = await Transaction.find({ jarId: jar._id });
      let currentAmount = 0;

      transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          currentAmount += transaction.amount;
        } else {
          currentAmount -= transaction.amount;
        }
      });

      await FinanceJar.findByIdAndUpdate(jar._id, {
        currentAmount: Math.max(0, currentAmount),
      });
    }

    console.log("Updated jar balances based on transactions");
    console.log("Finance seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding finance data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Chạy seeder
const runSeeder = async () => {
  await connectToDatabase();
  await seedFinanceData();
};

if (require.main === module) {
  runSeeder();
}

module.exports = { seedFinanceData };
