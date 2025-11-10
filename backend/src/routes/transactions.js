const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

/**
 * GET /api/transactions
 * ดูรายการธุรกรรมทั้งหมด
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, accountId, categoryId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
    };

    if (type) where.type = type;
    if (accountId) where.accountId = accountId;
    if (categoryId) where.categoryId = categoryId;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: { name: true, type: true },
          },
          category: {
            select: { name: true, type: true, color: true, icon: true },
          },
          toAccount: {
            select: { name: true, type: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/transactions
 * สร้างธุรกรรมใหม่
 */
router.post('/', [
  authenticateToken,
  body('type').isIn(['INCOME', 'EXPENSE', 'TRANSFER']).withMessage('Invalid transaction type'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('accountId').notEmpty().withMessage('Account ID is required'),
  body('categoryId').notEmpty().withMessage('Category ID is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { type, amount, description, note, date, accountId, categoryId, toAccountId } = req.body;

    // ตรวจสอบว่าบัญชีเป็นของผู้ใช้คนนี้
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.user.id },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // ตรวจสอบหมวดหมู่
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.user.id },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // สร้างธุรกรรม
    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        note,
        date: date ? new Date(date) : new Date(),
        userId: req.user.id,
        accountId,
        categoryId,
        toAccountId: type === 'TRANSFER' ? toAccountId : null,
      },
      include: {
        account: {
          select: { name: true, type: true },
        },
        category: {
          select: { name: true, type: true, color: true, icon: true },
        },
        toAccount: {
          select: { name: true, type: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;