const mongoose = require("mongoose");
const MAsset = require("../models/MAsset");

const seedAssets = async () => {
  const assets = [
    {
      type: "stock",
      code: "STOCK",
      name: "Chứng khoán",
      currency: "VND",
      unit: "cp",
      provider: "SSI",
      exchange: "HOSE",
      metadata: {},
    },
    {
      type: "stock",
      code: "BOND",
      name: "Cổ phiếu",
      currency: "VND",
      unit: "cp",
      provider: "VNDIRECT",
      exchange: "HOSE",
      metadata: {},
    },
    {
      type: "mutual_fund",
      code: "FUND",
      name: "CCQ",
      currency: "VND",
      unit: "ccq",
      provider: "VFM",
      exchange: "HOSE",
      metadata: {},
    },
    {
      type: "gold",
      code: "GOLD",
      name: "Vàng",
      currency: "VND",
      unit: "oz",
      provider: "PNJ",
      exchange: "",
      metadata: {},
    },
    {
      type: "crypto",
      code: "BTC",
      name: "Bitcoin",
      currency: "USD",
      unit: "coin",
      provider: "Binance",
      exchange: "Binance",
      metadata: {},
    },
    {
      type: "real_estate",
      code: "REAL_ESTATE",
      name: "Bất động sản",
      currency: "VND",
      unit: "m2",
      provider: "Novaland",
      exchange: "",
      metadata: {},
    },
  ];

  try {
    // Load environment variables
    require("dotenv").config();

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing assets
    await MAsset.deleteMany();
    console.log("Existing assets cleared");

    // Insert seed data
    await MAsset.insertMany(assets);
    console.log("Assets seeded successfully");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding assets:", error);
    mongoose.disconnect();
  }
};

seedAssets();
