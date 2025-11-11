const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountById
} = require('../controllers/accountController');

// ทุก route ใน accounts ต้องผ่าน authentication
router.use(authenticateToken);

// GET /api/accounts - ดึงบัญชีทั้งหมดของผู้ใช้
router.get('/', getAllAccounts);

// GET /api/accounts/:id - ดึงบัญชีเดียว
router.get('/:id', getAccountById);

// POST /api/accounts - สร้างบัญชีใหม่
router.post('/', createAccount);

// PUT /api/accounts/:id - อัปเดตบัญชี
router.put('/:id', updateAccount);

// DELETE /api/accounts/:id - ลบบัญชี
router.delete('/:id', deleteAccount);

module.exports = router;