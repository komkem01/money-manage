const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

/**
 * GET /api/dashboard/overview
 * ดูภาพรวมข้อมูลสำหรับ Dashboard
 */
router.get('/overview', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // คำนวณยอดคงเหลือรวม
    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true },
      select: { balance: true },
    });

    const totalBalance = accounts.reduce((sum, account) => {
      return sum + parseFloat(account.balance);
    }, 0);

    // คำนวณรายรับรายจ่ายเดือนนี้
    const [incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = parseFloat(incomeResult._sum.amount) || 0;
    const totalExpense = parseFloat(expenseResult._sum.amount) || 0;

    // ดึงรายการธุรกรรมล่าสุด 5 รายการ
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        account: {
          select: { name: true, type: true },
        },
        category: {
          select: { name: true, type: true, color: true, icon: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalBalance,
          totalIncome,
          totalExpense,
          netIncome: totalIncome - totalExpense,
        },
        recentTransactions,
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/monthly-summary
 * สรุปรายรับรายจ่ายรายเดือน
 */
router.get('/monthly-summary', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    // สรุปตามหมวดหมู่
    const categorySummary = await prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // ดึงข้อมูลหมวดหมู่
    const categoryIds = categorySummary.map(item => item.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, type: true, color: true, icon: true },
    });

    // รวมข้อมูล
    const summaryWithCategories = categorySummary.map(item => {
      const category = categories.find(cat => cat.id === item.categoryId);
      return {
        ...item,
        category,
        totalAmount: parseFloat(item._sum.amount),
        transactionCount: item._count.id,
      };
    });

    res.json({
      success: true,
      data: {
        month: parseInt(month),
        year: parseInt(year),
        summary: summaryWithCategories,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;