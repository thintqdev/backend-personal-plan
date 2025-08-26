const express = require("express");
const router = express.Router();
const monthlyReportController = require("../controllers/monthlyReportController");

/**
 * @swagger
 * components:
 *   schemas:
 *     JarReport:
 *       type: object
 *       properties:
 *         jarId:
 *           type: string
 *         jarName:
 *           type: string
 *         jarCategory:
 *           type: string
 *         allocatedAmount:
 *           type: number
 *         actualSpent:
 *           type: number
 *         actualIncome:
 *           type: number
 *         savings:
 *           type: number
 *         percentage:
 *           type: number
 *         transactions:
 *           type: array
 *           items:
 *             type: object
 *     MonthlyReport:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         month:
 *           type: number
 *         year:
 *           type: number
 *         userIncome:
 *           type: number
 *         totalAllocated:
 *           type: number
 *         totalSpent:
 *           type: number
 *         totalSavings:
 *           type: number
 *         carryOverFromPreviousMonth:
 *           type: number
 *         carryOverToNextMonth:
 *           type: number
 *         jarsReport:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JarReport'
 *         isFinalized:
 *           type: boolean
 *         finalizedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/finance/reports:
 *   get:
 *     summary: Lấy danh sách báo cáo hàng tháng
 *     tags: [Monthly Reports]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *       - in: query
 *         name: month
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 12
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Danh sách báo cáo hàng tháng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MonthlyReport'
 */

/**
 * @swagger
 * /api/finance/reports/generate:
 *   post:
 *     summary: Tạo báo cáo hàng tháng (manual)
 *     tags: [Monthly Reports]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: number
 *               month:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 12
 *     responses:
 *       201:
 *         description: Báo cáo được tạo thành công
 */

/**
 * @swagger
 * /api/finance/reports/{year}/{month}:
 *   get:
 *     summary: Lấy báo cáo theo tháng/năm cụ thể
 *     tags: [Monthly Reports]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 12
 *     responses:
 *       200:
 *         description: Báo cáo tháng
 *       404:
 *         description: Không tìm thấy báo cáo
 */

/**
 * @swagger
 * /api/finance/reports/{year}/{month}/finalize:
 *   put:
 *     summary: Khóa báo cáo tháng
 *     tags: [Monthly Reports]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 12
 *     responses:
 *       200:
 *         description: Báo cáo đã được khóa
 *       400:
 *         description: Báo cáo đã được khóa từ trước
 */

/**
 * @swagger
 * /api/finance/reports/{year}/{month}/pdf-data:
 *   get:
 *     summary: Lấy dữ liệu báo cáo để frontend tạo PDF
 *     tags: [Monthly Reports]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *         description: Năm báo cáo
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng báo cáo
 *     responses:
 *       200:
 *         description: Dữ liệu báo cáo để tạo PDF
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportInfo:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: number
 *                     month:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                     isFinalized:
 *                       type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     income:
 *                       type: number
 *                 summary:
 *                   type: object
 *                   properties:
 *                     userIncome:
 *                       type: number
 *                     totalAllocated:
 *                       type: number
 *                     totalSpent:
 *                       type: number
 *                     totalSavings:
 *                       type: number
 *                 jarsReport:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JarReport'
 *                 categorySpending:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       percentage:
 *                         type: string
 *                 formatted:
 *                   type: object
 *                   description: Các giá trị đã format để hiển thị
 *                 colors:
 *                   type: object
 *                   description: Bảng màu cho styling
 *       404:
 *         description: Không tìm thấy báo cáo
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/finance/reports/{year}/{month}/pdf:
 *   get:
 *     summary: Tạo PDF báo cáo chi tiêu theo tháng (Deprecated - sử dụng pdf-data)
 *     tags: [Monthly Reports]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *         description: Năm báo cáo
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng báo cáo
 *     responses:
 *       302:
 *         description: Redirect to pdf-data endpoint
 *       404:
 *         description: Không tìm thấy báo cáo
 */

// Routes
router.get("/", monthlyReportController.getMonthlyReports);
router.post("/generate", monthlyReportController.generateMonthlyReport);
router.get("/:year/:month", monthlyReportController.getMonthlyReport);
router.get("/:year/:month/pdf-data", monthlyReportController.getPDFReportData);
router.get("/:year/:month/pdf", monthlyReportController.generatePDFReport);
router.put(
  "/:year/:month/finalize",
  monthlyReportController.finalizeMonthlyReport
);

module.exports = router;
