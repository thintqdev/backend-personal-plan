const Cover = require("../models/Cover");

/**
 * Get all covers with optional filtering
 * GET /api/covers
 */
exports.getAllCovers = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const covers = await Cover.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Cover.countDocuments(filter);
    
    res.json({
      covers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching covers:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get cover by ID
 * GET /api/covers/:id
 */
exports.getCoverById = async (req, res) => {
  try {
    const cover = await Cover.findById(req.params.id);
    
    if (!cover) {
      return res.status(404).json({ error: "Cover not found" });
    }
    
    res.json(cover);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid cover ID" });
    }
    console.error("Error fetching cover:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create new cover
 * POST /api/covers
 */
exports.createCover = async (req, res) => {
  try {
    const { imageUrl, title, description, isActive = true } = req.body;

    // Validate required fields
    if (!imageUrl) {
      return res.status(400).json({ 
        error: "Image URL is required" 
      });
    }

    const cover = new Cover({
      imageUrl,
      title,
      description,
      isActive
    });

    await cover.save();
    
    res.status(201).json(cover);
  } catch (error) {
    console.error("Error creating cover:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update cover
 * PUT /api/covers/:id
 */
exports.updateCover = async (req, res) => {
  try {
    const { imageUrl, title, description, isActive } = req.body;
    
    const updateData = {};
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const cover = await Cover.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!cover) {
      return res.status(404).json({ error: "Cover not found" });
    }

    res.json(cover);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid cover ID" });
    }
    console.error("Error updating cover:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete cover
 * DELETE /api/covers/:id
 */
exports.deleteCover = async (req, res) => {
  try {
    const cover = await Cover.findByIdAndDelete(req.params.id);

    if (!cover) {
      return res.status(404).json({ error: "Cover not found" });
    }

    res.json({ message: "Cover deleted successfully" });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid cover ID" });
    }
    console.error("Error deleting cover:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get random active covers for layout integration
 * GET /api/covers/random
 */
exports.getRandomCovers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const covers = await Cover.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: parseInt(limit) } }
    ]);
    
    res.json(covers);
  } catch (error) {
    console.error("Error fetching random covers:", error);
    res.status(500).json({ error: error.message });
  }
};