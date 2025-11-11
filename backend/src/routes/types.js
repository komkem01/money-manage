const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllTypes,
  getTypeById
} = require('../controllers/typeController');

// ทุก route ใน types ต้องผ่าน authentication
router.use(authenticateToken);

// GET /api/types - ดึงประเภททั้งหมด
router.get('/', getAllTypes);

// GET /api/types/:id - ดึงประเภทเดียว
router.get('/:id', getTypeById);

module.exports = router;