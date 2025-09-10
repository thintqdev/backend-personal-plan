const Investment = require("../models/Investment");

exports.createInvestment = async (req, res) => {
  try {
    const { userId, assetId, amount, date, description } = req.body;

    // Make sure the userId from the request matches the authenticated user
    if (req.user && req.user._id && userId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          error: "Not authorized to create investment for another user",
        });
    }

    const investment = await Investment.create({
      userId: req.user ? req.user._id : userId, // Use authenticated user ID if available
      assetId,
      amount,
      date,
      description,
    });
    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvestments = async (req, res) => {
  try {
    // If authenticated, only get investments for the current user
    const query = req.user ? { userId: req.user._id } : {};

    const investments = await Investment.find(query)
      .populate("assetId", "name type code currency unit provider exchange")
      .sort({ date: -1 }); // Sort by date descending (newest first)

    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const investment = await Investment.findById(id).populate(
      "assetId",
      "name type code currency unit provider exchange"
    );
    if (!investment)
      return res.status(404).json({ error: "Investment not found" });
    res.status(200).json(investment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInvestment = await Investment.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedInvestment)
      return res.status(404).json({ error: "Investment not found" });
    res.status(200).json(updatedInvestment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInvestment = await Investment.findByIdAndDelete(id);
    if (!deletedInvestment)
      return res.status(404).json({ error: "Investment not found" });
    res.status(200).json({ message: "Investment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
