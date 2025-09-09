const Cover = require("../models/Cover");
const User = require("../models/User");

// Lấy tất cả covers của user
const getUserCovers = async (req, res) => {
  try {
    const userId = req.user.id;

    const covers = await Cover.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: covers,
    });
  } catch (error) {
    console.error("Error getting user covers:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy covers",
    });
  }
};

// Lấy cover đang active của user
const getActiveCover = async (req, res) => {
  try {
    const userId = req.user.id;

    const cover = await Cover.findOne({ userId, isActive: true });

    if (!cover) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cover active cho user này",
      });
    }

    res.status(200).json({
      success: true,
      data: cover,
    });
  } catch (error) {
    console.error("Error getting active cover:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy cover active",
    });
  }
};

// Đặt cover làm active
const setActiveCover = async (req, res) => {
  try {
    const userId = req.user.id;
    const { coverId } = req.params;

    // Kiểm tra cover có tồn tại và thuộc về user không
    const cover = await Cover.findOne({ _id: coverId, userId });
    if (!cover) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cover",
      });
    }

    // Đặt tất cả covers của user thành inactive
    await Cover.updateMany({ userId }, { isActive: false });

    // Đặt cover được chọn thành active
    cover.isActive = true;
    await cover.save();

    res.status(200).json({
      success: true,
      message: "Đặt cover active thành công",
      data: cover,
    });
  } catch (error) {
    console.error("Error setting active cover:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đặt cover active",
    });
  }
};

// Tạo cover mới
const createCover = async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageUrl, title, description } = req.body;

    // Validate input
    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "URL ảnh là bắt buộc",
      });
    }

    // Kiểm tra URL hợp lệ (cơ bản)
    try {
      new URL(imageUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "URL ảnh không hợp lệ",
      });
    }

    // Tạo cover mới
    const cover = new Cover({
      userId,
      imageUrl: imageUrl.trim(),
      title: title ? title.trim() : "",
      description: description ? description.trim() : "",
      isActive: false, // Mặc định không active
    });

    await cover.save();

    res.status(201).json({
      success: true,
      message: "Tạo cover thành công",
      data: cover,
    });
  } catch (error) {
    console.error("Error creating cover:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo cover",
    });
  }
};

// Cập nhật cover cụ thể
const updateCover = async (req, res) => {
  try {
    const userId = req.user.id;
    const { coverId } = req.params;
    const { imageUrl, title, description } = req.body;

    // Kiểm tra cover có tồn tại và thuộc về user không
    const cover = await Cover.findOne({ _id: coverId, userId });
    if (!cover) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cover",
      });
    }

    // Validate input nếu có
    if (imageUrl) {
      if (!imageUrl.trim()) {
        return res.status(400).json({
          success: false,
          message: "URL ảnh không được để trống",
        });
      }

      try {
        new URL(imageUrl);
        cover.imageUrl = imageUrl.trim();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "URL ảnh không hợp lệ",
        });
      }
    }

    if (title !== undefined) {
      cover.title = title ? title.trim() : "";
    }

    if (description !== undefined) {
      cover.description = description ? description.trim() : "";
    }

    await cover.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật cover thành công",
      data: cover,
    });
  } catch (error) {
    console.error("Error updating cover:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật cover",
    });
  }
};

// Xóa cover cụ thể
const deleteCover = async (req, res) => {
  try {
    const userId = req.user.id;
    const { coverId } = req.params;

    // Kiểm tra cover có tồn tại và thuộc về user không
    const cover = await Cover.findOne({ _id: coverId, userId });
    if (!cover) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cover",
      });
    }

    // Nếu cover đang active, không cho phép xóa
    if (cover.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa cover đang active. Hãy đặt cover khác làm active trước.",
      });
    }

    await Cover.findByIdAndDelete(coverId);

    res.status(200).json({
      success: true,
      message: "Xóa cover thành công",
    });
  } catch (error) {
    console.error("Error deleting cover:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa cover",
    });
  }
};

// Lấy danh sách cover mẫu (có thể dùng cho gợi ý)
const getCoverSuggestions = async (req, res) => {
  try {
    // Có thể trả về một số URL mẫu hoặc lấy từ database
    const suggestions = [
      {
        id: "default-1",
        imageUrl: "/soft-pink-abstract-pattern-for-personal-planning.png",
        title: "Mẫu bìa hồng pastel",
        description: "Thiết kế đơn giản với màu hồng dịu nhẹ",
      },
      {
        id: "default-2",
        imageUrl: "/mountain-peak-sunrise-motivation-success.png",
        title: "Ngọn núi bình minh",
        description: "Cảnh quan núi non với ánh nắng ban mai",
      },
      {
        id: "default-3",
        imageUrl: "/person-climbing-stairs-to-success.png",
        title: "Leo thang thành công",
        description: "Hình ảnh động lực với người đang leo thang",
      },
      {
        id: "default-4",
        imageUrl: "/runner-crossing-finish-line-victory.png",
        title: "Vượt đích chiến thắng",
        description: "Chạy đua và chiến thắng mục tiêu",
      },
      {
        id: "default-5",
        imageUrl: "/lighthouse-guiding-ships-motivation.png",
        title: "Ngọn hải đăng",
        description: "Ánh sáng dẫn đường giữa biển cả",
      },
      {
        id: "default-6",
        imageUrl: "/eagle-soaring-high-mountains-freedom.png",
        title: "Đại bàng bay cao",
        description: "Tự do và tầm nhìn cao rộng",
      },
      {
        id: "default-7",
        imageUrl: "/peaceful-pink-sunset-landscape.png",
        title: "Hoàng hôn bình yên",
        description: "Cảnh hoàng hôn với màu hồng dịu nhẹ",
      },
    ];

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error getting cover suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy gợi ý cover",
    });
  }
};

module.exports = {
  getUserCovers,
  getActiveCover,
  setActiveCover,
  createCover,
  updateCover,
  deleteCover,
  getCoverSuggestions,
};
