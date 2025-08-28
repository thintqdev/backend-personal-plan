const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

/**
 * @swagger
 * components:
 *   schemas:
 *     NoteFolder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         label:
 *           type: string
 *         color:
 *           type: string
 *         icon:
 *           type: string
 *         isDefault:
 *           type: boolean
 *         sortOrder:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         __v:
 *           type: number
 *     Note:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         folderId:
 *           oneOf:
 *             - type: string
 *             - $ref: '#/components/schemas/NoteFolder'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isArchived:
 *           type: boolean
 *         isFavorite:
 *           type: boolean
 *         lastViewedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         __v:
 *           type: number
 *     NotesTree:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         label:
 *           type: string
 *         color:
 *           type: string
 *         icon:
 *           type: string
 *         isDefault:
 *           type: boolean
 *         sortOrder:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         children:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isFavorite:
 *                 type: boolean
 *               lastViewedAt:
 *                 type: string
 *                 format: date-time
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *     CreateFolderRequest:
 *       type: object
 *       required:
 *         - label
 *       properties:
 *         label:
 *           type: string
 *         color:
 *           type: string
 *         icon:
 *           type: string
 *     CreateNoteRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - folderId
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         folderId:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *     UpdateNoteRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         folderId:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isFavorite:
 *           type: boolean
 *         isArchived:
 *           type: boolean
 */

// ==================== FOLDER ROUTES ====================

/**
 * @swagger
 * /api/notes/folders:
 *   get:
 *     summary: Lấy tất cả folders
 *     tags: [Note Folders]
 *     responses:
 *       200:
 *         description: Danh sách folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NoteFolder'
 *   post:
 *     summary: Tạo folder mới
 *     tags: [Note Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFolderRequest'
 *     responses:
 *       201:
 *         description: Folder được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteFolder'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.get("/folders", noteController.getAllFolders);
router.post("/folders", noteController.createFolder);

/**
 * @swagger
 * /api/notes/folders/{id}:
 *   put:
 *     summary: Cập nhật folder
 *     tags: [Note Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               sortOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: Folder được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteFolder'
 *       404:
 *         description: Folder not found
 *   delete:
 *     summary: Xóa folder và tất cả notes bên trong
 *     tags: [Note Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Folder được xóa thành công
 *       400:
 *         description: Không thể xóa folder mặc định
 *       404:
 *         description: Folder not found
 */
router.put("/folders/:id", noteController.updateFolder);
router.delete("/folders/:id", noteController.deleteFolder);

// ==================== NOTE ROUTES ====================

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Lấy tất cả notes
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: Danh sách notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *   post:
 *     summary: Tạo note mới
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNoteRequest'
 *     responses:
 *       201:
 *         description: Note được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.get("/", noteController.getAllNotes);
router.post("/", noteController.createNote);

/**
 * @swagger
 * /api/notes/tree:
 *   get:
 *     summary: Lấy cấu trúc cây notes theo folder
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: Cấu trúc cây notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotesTree'
 */
router.get("/tree", noteController.getNotesTree);

/**
 * @swagger
 * /api/notes/search:
 *   get:
 *     summary: Tìm kiếm notes
 *     tags: [Notes]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *         description: Lọc theo folder
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Lọc theo tags
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       400:
 *         description: Thiếu từ khóa tìm kiếm
 */
router.get("/search", noteController.searchNotes);

/**
 * @swagger
 * /api/notes/stats:
 *   get:
 *     summary: Thống kê notes
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: Thống kê notes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalNotes:
 *                   type: number
 *                 archivedNotes:
 *                   type: number
 *                 favoriteNotes:
 *                   type: number
 *                 totalFolders:
 *                   type: number
 *                 recentNotes:
 *                   type: number
 *                 notesByFolder:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       folderName:
 *                         type: string
 *                       count:
 *                         type: number
 */
router.get("/stats", noteController.getNoteStats);

/**
 * @swagger
 * /api/notes/folder/{folderId}:
 *   get:
 *     summary: Lấy notes theo folder
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách notes trong folder
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       404:
 *         description: Folder not found
 */
router.get("/folder/:folderId", noteController.getNotesByFolder);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Lấy note theo ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *   put:
 *     summary: Cập nhật note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNoteRequest'
 *     responses:
 *       200:
 *         description: Note được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *   delete:
 *     summary: Xóa note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note được xóa thành công
 *       404:
 *         description: Note not found
 */
router.get("/:id", noteController.getNoteById);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

module.exports = router;