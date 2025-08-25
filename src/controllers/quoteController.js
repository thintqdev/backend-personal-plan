const Quote = require("../models/Quote");

// Lấy danh sách tất cả câu châm ngôn
exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find();
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm câu châm ngôn mới
exports.createQuote = async (req, res) => {
  try {
    const { text } = req.body;
    const quote = new Quote({ text });
    await quote.save();
    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sửa câu châm ngôn
exports.updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const quote = await Quote.findByIdAndUpdate(id, { text }, { new: true });
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá câu châm ngôn
exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByIdAndDelete(id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    res.json({ message: "Quote deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
