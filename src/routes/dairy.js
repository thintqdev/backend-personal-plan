const express = require("express");
const router = express.Router();
const dairyController = require("../controllers/dairyController");
const auth = require("../middleware/auth");

// Lấy danh sách nhật ký của user
router.get("/", auth, dairyController.getAllDairies);
// Tạo nhật ký mới
router.post("/", auth, dairyController.createDairy);
// Sửa nhật ký
router.put("/:id", auth, dairyController.updateDairy);
// Xoá nhật ký
router.delete("/:id", auth, dairyController.deleteDairy);

module.exports = router;
