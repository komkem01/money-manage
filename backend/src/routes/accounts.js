const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

/**
 * GET /api/accounts
 * ดูรายการบัญชีทั้งหมด
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { 
        userId: req.user.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { accounts },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/accounts
 * สร้างบัญชีใหม่
 */
router.post('/', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Account name is required'),
  body('type').isIn(['CASH', 'BANK_ACCOUNT', 'CREDIT_CARD', 'DEBIT_CARD', 'E_WALLET', 'INVESTMENT', 'LOAN', 'OTHER']).withMessage('Invalid account type'),
  body('balance').isNumeric().withMessage('Balance must be a number'),
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

    const { name, type, balance, description } = req.body;

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: parseFloat(balance) || 0,
        description,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { account },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;