const express = require("express");
const router = express.Router();
const coverController = require("../controllers/coverController");
const { authenticateJWT, optionalJWT } = require("../middlewares/jwtAuth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Cover:
 *       type: object
 *       required:
 *         - imageUrl
 *       properties:
 *         _id:
 *           type: string
 *           description: Cover ID
 *         imageUrl:
 *           type: string
 *           description: Cover image URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/covers:
 *   get:
 *     summary: Lấy danh sách covers với phân trang
 *     tags: [Cover]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Covers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 covers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cover'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *   post:
 *     summary: Tạo cover mới
 *     tags: [Cover]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: Cover image URL
 *     responses:
 *       201:
 *         description: Cover created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cover'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/covers/{id}:
 *   get:
 *     summary: Lấy cover theo ID
 *     tags: [Cover]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cover ID
 *     responses:
 *       200:
 *         description: Cover retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cover'
 *       404:
 *         description: Cover not found
 *       400:
 *         description: Invalid cover ID
 *   put:
 *     summary: Cập nhật cover
 *     tags: [Cover]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cover ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: Cover image URL
 *     responses:
 *       200:
 *         description: Cover updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cover'
 *       404:
 *         description: Cover not found
 *       400:
 *         description: Validation error
 *   delete:
 *     summary: Xóa cover
 *     tags: [Cover]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cover ID
 *     responses:
 *       200:
 *         description: Cover deleted successfully
 *       404:
 *         description: Cover not found
 *       400:
 *         description: Invalid cover ID
 */

// Routes with simple API key protection
router.get("/", optionalJWT, coverController.getAllCovers); // Allow both authenticated and unauthenticated access
router.get("/random", optionalJWT, coverController.getRandomCovers); // Get random covers for layout
router.get("/:id", optionalJWT, coverController.getCoverById); // Allow both authenticated and unauthenticated access
router.post("/", authenticateJWT, coverController.createCover); // Require JWT
router.put("/:id", authenticateJWT, coverController.updateCover); // Require JWT
router.delete("/:id", authenticateJWT, coverController.deleteCover); // Require JWT

module.exports = router;