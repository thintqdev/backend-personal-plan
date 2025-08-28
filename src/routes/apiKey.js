const express = require("express");
const router = express.Router();
const apiKeyController = require("../controllers/apiKeyController");

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiKey:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: API Key ID
 *         name:
 *           type: string
 *           description: API Key name
 *         maskedKey:
 *           type: string
 *           description: Masked API key for display
 *         isActive:
 *           type: boolean
 *           description: Whether the API key is active
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of permissions granted to this API key
 *         lastUsedAt:
 *           type: string
 *           format: date-time
 *           description: Last usage timestamp
 *         usageCount:
 *           type: number
 *           description: Number of times this key has been used
 *         rateLimit:
 *           type: object
 *           properties:
 *             requestsPerMinute:
 *               type: number
 *             requestsPerHour:
 *               type: number
 *             requestsPerDay:
 *               type: number
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Expiration date (null means no expiration)
 *         createdBy:
 *           type: string
 *           description: Who created this API key
 *         description:
 *           type: string
 *           description: API key description
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/apikeys:
 *   get:
 *     summary: Get all API keys with pagination
 *     tags: [ApiKeys]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKeys:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApiKey'
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
 *     summary: Create new API key
 *     tags: [ApiKeys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: API key name
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [read:covers, write:covers, read:quotes, write:quotes, read:users, write:users, read:goals, write:goals, read:tasks, write:tasks, read:notes, write:notes, read:finance, write:finance, admin:all]
 *                 description: List of permissions
 *               description:
 *                 type: string
 *                 description: API key description
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date
 *               rateLimit:
 *                 type: object
 *                 properties:
 *                   requestsPerMinute:
 *                     type: number
 *                   requestsPerHour:
 *                     type: number
 *                   requestsPerDay:
 *                     type: number
 *               createdBy:
 *                 type: string
 *                 description: Creator identifier
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiKey'
 *                 - type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       description: The actual API key (only returned once)
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/apikeys/{id}:
 *   get:
 *     summary: Get API key by ID
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKey'
 *       404:
 *         description: API key not found
 *       400:
 *         description: Invalid API key ID
 *   put:
 *     summary: Update API key
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               rateLimit:
 *                 type: object
 *     responses:
 *       200:
 *         description: API key updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKey'
 *       404:
 *         description: API key not found
 *       400:
 *         description: Validation error
 *   delete:
 *     summary: Delete API key
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       404:
 *         description: API key not found
 *       400:
 *         description: Invalid API key ID
 */

/**
 * @swagger
 * /api/apikeys/{id}/regenerate:
 *   post:
 *     summary: Regenerate API key
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiKey'
 *                 - type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       description: The new API key
 *       404:
 *         description: API key not found
 *       400:
 *         description: Invalid API key ID
 */

/**
 * @swagger
 * /api/apikeys/{id}/usage:
 *   get:
 *     summary: Get API key usage statistics
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 usageCount:
 *                   type: number
 *                 lastUsedAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 isActive:
 *                   type: boolean
 *                 isExpired:
 *                   type: boolean
 *       404:
 *         description: API key not found
 *       400:
 *         description: Invalid API key ID
 */

// Routes
router.get("/", apiKeyController.getUserApiKeys); // Get current user's API keys
router.get("/all", apiKeyController.getAllApiKeys); // Get all API keys (admin)
router.get("/:id", apiKeyController.getApiKeyById);
router.post("/", apiKeyController.createApiKey);
router.put("/:id", apiKeyController.updateApiKey);
router.delete("/:id", apiKeyController.deleteApiKey);
router.post("/:id/regenerate", apiKeyController.regenerateApiKey);
router.get("/:id/usage", apiKeyController.getUsageStats);

module.exports = router;