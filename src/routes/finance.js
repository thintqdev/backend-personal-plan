const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const financeJarController = require("../controllers/financeJarController");
const transactionController = require("../controllers/transactionController");
const monthlyReportRoutes = require("./monthlyReport");

/**
 * @swagger
 * components:
 *   schemas:
 *     FinanceJar:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         targetAmount:
 *           type: number
 *         currentAmount:
 *           type: number
 *         percentage:
 *           type: number
 *         color:
 *           type: string
 *         icon:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [High, Medium, Low]
 *         category:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         __v:
 *           type: number
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         jarId:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         description:
 *           type: string
 *         date:
 *           type: string
 *         category:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         __v:
 *           type: number
 *     CreateFinanceJarRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - targetAmount
 *         - percentage
 *         - color
 *         - icon
 *         - priority
 *         - category
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         targetAmount:
 *           type: number
 *         percentage:
 *           type: number
 *         color:
 *           type: string
 *         icon:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [High, Medium, Low]
 *         category:
 *           type: string
 *     CreateTransactionRequest:
 *       type: object
 *       required:
 *         - jarId
 *         - amount
 *         - type
 *         - description
 *         - category
 *       properties:
 *         jarId:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         description:
 *           type: string
 *         category:
 *           type: string
 */

/**
 * @swagger
 * /api/finance/jars:
 *   get:
 *     summary: Lấy tất cả finance jars
 *     tags: [Finance]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [High, Medium, Low]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách finance jars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FinanceJar'
 *   post:
 *     summary: Tạo finance jar mới
 *     tags: [Finance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFinanceJarRequest'
 *     responses:
 *       201:
 *         description: Finance jar được tạo thành công
 */

/**
 * @swagger
 * /api/finance/overview:
 *   get:
 *     summary: Lấy tổng quan tài chính
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Tổng quan tài chính
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 totalSavings:
 *                   type: number
 *                 jarsCount:
 *                   type: number
 *                 activeJarsCount:
 *                   type: number
 *                 totalAllocated:
 *                   type: number
 *                 remainingPercentage:
 *                   type: number
 */

// Finance Jar Routes
router.get("/jars", auth, financeJarController.getAllJars);
router.get("/jars/:id", auth, financeJarController.getJarById);
router.post("/jars", auth, financeJarController.createJar);
router.put("/jars/:id", auth, financeJarController.updateJar);
router.delete("/jars/:id", auth, financeJarController.deleteJar);

// Finance Overview
router.get("/overview", auth, financeJarController.getFinanceOverview);

// Transaction Routes
router.get("/transactions", auth, transactionController.getAllTransactions);
router.get("/transactions/stats", auth, transactionController.getTransactionStats);
router.get("/transactions/:id", auth, transactionController.getTransactionById);
router.post("/transactions", auth, transactionController.createTransaction);
router.put("/transactions/:id", auth, transactionController.updateTransaction);
router.delete("/transactions/:id", auth, transactionController.deleteTransaction);

// Jar-specific transaction routes
router.get(
  "/jars/:jarId/transactions",
  auth,
  transactionController.getTransactionsByJar
);

// Monthly Reports routes
router.use("/reports", auth, monthlyReportRoutes);

module.exports = router;
