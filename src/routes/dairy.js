const express = require("express");
const router = express.Router();
const dairyController = require("../controllers/dairyController");

// Lấy danh sách nhật ký của user
router.get("/", dairyController.getAllDairies);
// Tạo nhật ký mới
router.post("/", dairyController.createDairy);
// Sửa nhật ký
router.put("/:id", dairyController.updateDairy);
// Xoá nhật ký
router.delete("/:id", dairyController.deleteDairy);

module.exports = router;
