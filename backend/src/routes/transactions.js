const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

/**
 * Transaction Routes
 * จัดการเส้นทาง API สำหรับธุรกรรม
 */

// ใช้ middleware สำหรับ authentication ทุก route
router.use(authenticateToken);

/**
 * @route   GET /api/transactions
 * @desc    ดึงรายการธุรกรรมทั้งหมดของผู้ใช้ (พร้อม pagination)
 * @access  Private
 */
router.get('/', getAllTransactions);

/**
 * @route   GET /api/transactions/:id
 * @desc    ดึงธุรกรรมตาม ID
 * @access  Private
 */
router.get('/:id', getTransactionById);

/**
 * @route   POST /api/transactions
 * @desc    สร้างธุรกรรมใหม่
 * @access  Private
 */
router.post('/', createTransaction);

/**
 * @route   PUT /api/transactions/:id
 * @desc    อัปเดตธุรกรรม
 * @access  Private
 */
router.put('/:id', updateTransaction);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    ลบธุรกรรม (Soft Delete)
 * @access  Private
 */
router.delete('/:id', deleteTransaction);

module.exports = router;