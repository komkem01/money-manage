const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

/**
 * GET /api/categories
 * ดูรายการหมวดหมู่ทั้งหมด
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { type } = req.query;
    
    const where = {
      userId: req.user.id,
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/categories
 * สร้างหมวดหมู่ใหม่
 */
router.post('/', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('type').isIn(['INCOME', 'EXPENSE', 'TRANSFER']).withMessage('Invalid category type'),
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

    const { name, type, color, icon, description } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        type,
        color: color || '#3B82F6',
        icon,
        description,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;