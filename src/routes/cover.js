const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getUserCovers,
  getActiveCover,
  setActiveCover,
  createCover,
  updateCover,
  deleteCover,
  getCoverSuggestions,
} = require("../controllers/coverController");

// Tất cả routes đều cần authentication
router.use(auth);

// Routes cho cover
router.get("/", auth, getUserCovers); // Lấy tất cả covers của user
router.get("/active", auth, getActiveCover); // Lấy cover đang active
router.post("/", auth, createCover); // Tạo cover mới
router.put("/:coverId", auth, updateCover); // Cập nhật cover cụ thể
router.patch("/:coverId/active", auth, setActiveCover); // Đặt cover làm active
router.delete("/:coverId", auth, deleteCover); // Xóa cover cụ thể
router.get("/suggestions", auth, getCoverSuggestions); // Lấy danh sách gợi ý cover

module.exports = router;
