const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // mutual_fund | stock | gold | crypto...
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    currency: { type: String, default: "VND" }, // VND, USD...
    unit: { type: String, default: "unit" }, // ccq, cp, oz, coin...
    provider: { type: String }, // công ty quản lý quỹ, sàn, ...
    exchange: { type: String }, // HOSE, NYSE, Binance...
    metadata: { type: Object }, // thêm gì cũng được
  },
  { timestamps: true, collection: "m_assets" } // <== collection name
);

module.exports = mongoose.model("MAsset", AssetSchema);
