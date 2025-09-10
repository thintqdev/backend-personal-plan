const MAsset = require("../models/MAsset");

// Create a new asset
exports.createAsset = async (req, res) => {
  try {
    const asset = new MAsset(req.body);
    await asset.save();
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all assets
exports.getAllAssets = async (req, res) => {
  try {
    const assets = await MAsset.find();
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single asset by ID
exports.getAssetById = async (req, res) => {
  try {
    const asset = await MAsset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an asset by ID
exports.updateAsset = async (req, res) => {
  try {
    const asset = await MAsset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.status(200).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an asset by ID
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await MAsset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
