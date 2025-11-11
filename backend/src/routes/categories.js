const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getCategoriesByType,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
} = require('../controllers/categoryController');

// ทุก route ใน categories ต้องผ่าน authentication
router.use(authenticateToken);

// GET /api/categories - ดึงหมวดหมู่ทั้งหมดของผู้ใช้
router.get('/', getAllCategories);

// GET /api/categories/type/:typeId - ดึงหมวดหมู่ตาม type
router.get('/type/:typeId', getCategoriesByType);

// GET /api/categories/:id - ดึงหมวดหมู่เดียว
router.get('/:id', getCategoryById);

// POST /api/categories - สร้างหมวดหมู่ใหม่
router.post('/', createCategory);

// PUT /api/categories/:id - อัปเดตหมวดหมู่
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - ลบหมวดหมู่
router.delete('/:id', deleteCategory);

module.exports = router;