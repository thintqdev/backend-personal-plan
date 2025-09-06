const express = require('express');
const router = express.Router();
const {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addMoneyToGoal,
    withdrawMoneyFromGoal,
    getSavingsGoalTransactions
} = require('../controllers/savingsGoalController');

/**
 * @swagger
 * components:
 *   schemas:
 *     SavingsGoal:
 *       type: object
 *       required:
 *         - name
 *         - targetAmount
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của mục tiêu tiết kiệm
 *         name:
 *           type: string
 *           description: Tên mục tiêu tiết kiệm
 *         description:
 *           type: string
 *           description: Mô tả mục tiêu
 *         targetAmount:
 *           type: number
 *           description: Số tiền mục tiêu
 *         currentAmount:
 *           type: number
 *           description: Số tiền hiện tại
 *         deadline:
 *           type: string
 *           format: date
 *           description: Hạn hoàn thành
 *         category:
 *           type: string
 *           description: Danh mục
 *         color:
 *           type: string
 *           description: Màu sắc
 *         icon:
 *           type: string
 *           description: Icon
 *         priority:
 *           type: string
 *           enum: [High, Medium, Low]
 *           description: Độ ưu tiên
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SavingsTransaction'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SavingsTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [deposit, withdraw]
 *         amount:
 *           type: number
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/savings-goals:
 *   get:
 *     summary: Lấy danh sách tất cả mục tiêu tiết kiệm
 *     tags: [Savings Goals]
 *     responses:
 *       200:
 *         description: Danh sách mục tiêu tiết kiệm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavingsGoal'
 */
router.get('/', getSavingsGoals);

/**
 * @swagger
 * /api/savings-goals:
 *   post:
 *     summary: Tạo mục tiêu tiết kiệm mới
 *     tags: [Savings Goals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - targetAmount
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *     responses:
 *       201:
 *         description: Mục tiêu tiết kiệm được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SavingsGoal'
 *                 message:
 *                   type: string
 */
router.post('/', createSavingsGoal);

/**
 * @swagger
 * /api/savings-goals/{id}:
 *   put:
 *     summary: Cập nhật mục tiêu tiết kiệm
 *     tags: [Savings Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của mục tiêu tiết kiệm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Mục tiêu tiết kiệm được cập nhật thành công
 */
router.put('/:id', updateSavingsGoal);

/**
 * @swagger
 * /api/savings-goals/{id}:
 *   delete:
 *     summary: Xóa mục tiêu tiết kiệm
 *     tags: [Savings Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của mục tiêu tiết kiệm
 *     responses:
 *       200:
 *         description: Mục tiêu tiết kiệm được xóa thành công
 */
router.delete('/:id', deleteSavingsGoal);

/**
 * @swagger
 * /api/savings-goals/{id}/add-money:
 *   post:
 *     summary: Thêm tiền vào mục tiêu tiết kiệm
 *     tags: [Savings Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của mục tiêu tiết kiệm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thêm tiền thành công
 */
router.post('/:id/add-money', addMoneyToGoal);

/**
 * @swagger
 * /api/savings-goals/{id}/withdraw-money:
 *   post:
 *     summary: Rút tiền từ mục tiêu tiết kiệm
 *     tags: [Savings Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của mục tiêu tiết kiệm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rút tiền thành công
 */
router.post('/:id/withdraw-money', withdrawMoneyFromGoal);

/**
 * @swagger
 * /api/savings-goals/{id}/transactions:
 *   get:
 *     summary: Lấy lịch sử giao dịch của mục tiêu tiết kiệm
 *     tags: [Savings Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của mục tiêu tiết kiệm
 *     responses:
 *       200:
 *         description: Lịch sử giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavingsTransaction'
 */
router.get('/:id/transactions', getSavingsGoalTransactions);

module.exports = router;
