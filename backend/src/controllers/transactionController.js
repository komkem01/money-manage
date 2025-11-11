const { PrismaClient } = require('@prisma/client');
const prisma = require('../utils/prisma');

/**
 * Transaction Controller
 * จัดการ CRUD operations สำหรับธุรกรรม
 */

/**
 * ดึงรายการธุรกรรมทั้งหมดของผู้ใช้ (พร้อม pagination)
 * GET /api/transactions
 */
const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log(`Getting transactions for user: ${userId}, page: ${page}, limit: ${limit}`);

    // นับจำนวนธุรกรรมทั้งหมด
    const totalCount = await prisma.transactions.count({
      where: {
        user_id: userId,
        deleted_at: null, // ไม่เอาที่ถูก soft delete
      },
    });

    // ดึงธุรกรรมพร้อม pagination
    const transactions = await prisma.transactions.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      include: {
        account: true,
        category: {
          include: {
            type: true,
          },
        },
        type: true,
        related_account: true,
      },
      orderBy: [
        { date: 'desc' },
        { created_at: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    // แปลง BigInt เป็น string
    const serializedTransactions = transactions.map(transaction => ({
      ...transaction,
      id: transaction.id,
      amount: transaction.amount.toString(),
      user_id: transaction.user_id,
      account_id: transaction.account_id,
      category_id: transaction.category_id,
      type_id: transaction.type_id,
      related_account_id: transaction.related_account_id,
      date: transaction.date.toString(),
      created_at: transaction.created_at?.toString(),
      updated_at: transaction.updated_at?.toString(),
      deleted_at: transaction.deleted_at?.toString(),
      account: {
        ...transaction.account,
        id: transaction.account.id,
        user_id: transaction.account.user_id,
        amount: transaction.account.amount.toString(),
        created_at: transaction.account.created_at?.toString(),
        updated_at: transaction.account.updated_at?.toString(),
        deleted_at: transaction.account.deleted_at?.toString(),
      },
      category: {
        ...transaction.category,
        id: transaction.category.id,
        user_id: transaction.category.user_id,
        type_id: transaction.category.type_id,
        created_at: transaction.category.created_at?.toString(),
        updated_at: transaction.category.updated_at?.toString(),
        deleted_at: transaction.category.deleted_at?.toString(),
        type: {
          ...transaction.category.type,
          id: transaction.category.type.id,
          created_at: transaction.category.type.created_at?.toString(),
          updated_at: transaction.category.type.updated_at?.toString(),
        },
      },
      type: {
        ...transaction.type,
        id: transaction.type.id,
        created_at: transaction.type.created_at?.toString(),
        updated_at: transaction.type.updated_at?.toString(),
      },
      related_account: transaction.related_account ? {
        ...transaction.related_account,
        id: transaction.related_account.id,
        user_id: transaction.related_account.user_id,
        amount: transaction.related_account.amount.toString(),
        created_at: transaction.related_account.created_at?.toString(),
        updated_at: transaction.related_account.updated_at?.toString(),
        deleted_at: transaction.related_account.deleted_at?.toString(),
      } : null,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: serializedTransactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการธุรกรรม',
      error: error.message,
    });
  }
};

/**
 * ดึงธุรกรรมตาม ID
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    console.log(`Getting transaction: ${transactionId} for user: ${userId}`);

    const transaction = await prisma.transactions.findFirst({
      where: {
        id: transactionId,
        user_id: userId,
        deleted_at: null,
      },
      include: {
        account: true,
        category: {
          include: {
            type: true,
          },
        },
        type: true,
        related_account: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบธุรกรรมที่ระบุ',
      });
    }

    // แปลง BigInt เป็น string
    const serializedTransaction = {
      ...transaction,
      id: transaction.id,
      amount: transaction.amount.toString(),
      user_id: transaction.user_id,
      account_id: transaction.account_id,
      category_id: transaction.category_id,
      type_id: transaction.type_id,
      related_account_id: transaction.related_account_id,
      date: transaction.date.toString(),
      created_at: transaction.created_at?.toString(),
      updated_at: transaction.updated_at?.toString(),
      account: {
        ...transaction.account,
        id: transaction.account.id,
        user_id: transaction.account.user_id,
        amount: transaction.account.amount.toString(),
        created_at: transaction.account.created_at?.toString(),
        updated_at: transaction.account.updated_at?.toString(),
        deleted_at: transaction.account.deleted_at?.toString(),
      },
      category: {
        ...transaction.category,
        id: transaction.category.id,
        user_id: transaction.category.user_id,
        type_id: transaction.category.type_id,
        created_at: transaction.category.created_at?.toString(),
        updated_at: transaction.category.updated_at?.toString(),
        deleted_at: transaction.category.deleted_at?.toString(),
        type: {
          ...transaction.category.type,
          id: transaction.category.type.id,
          created_at: transaction.category.type.created_at?.toString(),
          updated_at: transaction.category.type.updated_at?.toString(),
        },
      },
      type: {
        ...transaction.type,
        id: transaction.type.id,
        created_at: transaction.type.created_at?.toString(),
        updated_at: transaction.type.updated_at?.toString(),
      },
      related_account: transaction.related_account ? {
        ...transaction.related_account,
        id: transaction.related_account.id,
        user_id: transaction.related_account.user_id,
        amount: transaction.related_account.amount.toString(),
        created_at: transaction.related_account.created_at?.toString(),
        updated_at: transaction.related_account.updated_at?.toString(),
        deleted_at: transaction.related_account.deleted_at?.toString(),
      } : null,
    };

    res.json({
      success: true,
      data: serializedTransaction,
    });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม',
      error: error.message,
    });
  }
};

/**
 * สร้างธุรกรรมใหม่
 * POST /api/transactions
 */
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, description, date, transaction_date, account_id, category_id, related_account_id } = req.body;

    // รองรับทั้ง date และ transaction_date (เพื่อ backward compatibility)
    const transactionDate = date || transaction_date;

    console.log('Creating transaction:', { amount, description, date: transactionDate, account_id, category_id, related_account_id });

    // Validation
    if (!amount || !account_id || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลที่จำเป็น: จำนวนเงิน, บัญชี, และหมวดหมู่',
      });
    }

    // ตรวจสอบว่า account และ category เป็นของผู้ใช้คนนี้
    const accountExists = await prisma.accounts.findFirst({
      where: {
        id: account_id,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!accountExists) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบบัญชีที่ระบุ',
      });
    }

    const categoryExists = await prisma.categories.findFirst({
      where: {
        id: category_id,
        user_id: userId,
        deleted_at: null,
      },
      include: {
        type: true,
      },
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบหมวดหมู่ที่ระบุ',
      });
    }

    // ตรวจสอบ related_account สำหรับ transfer
    if (related_account_id) {
      const relatedAccountExists = await prisma.accounts.findFirst({
        where: {
          id: related_account_id,
          user_id: userId,
          deleted_at: null,
        },
      });

      if (!relatedAccountExists) {
        return res.status(400).json({
          success: false,
          message: 'ไม่พบบัญชีปลายทางที่ระบุ',
        });
      }
    }

    // สร้างธุรกรรมใหม่
    const newTransaction = await prisma.transactions.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        date: BigInt(new Date(transactionDate || new Date()).getTime()),
        user_id: userId,
        type_id: categoryExists.type_id,
        account_id: account_id,
        category_id: category_id,
        related_account_id: related_account_id || null,
        created_at: BigInt(Date.now()),
      },
      include: {
        account: true,
        category: {
          include: {
            type: true,
          },
        },
        type: true,
        related_account: true,
      },
    });

    // อัปเดตยอดเงินในบัญชี
    let balanceChange = parseFloat(amount);

    if (categoryExists.type.name === 'Expense') {
      balanceChange = -balanceChange; // รายจ่าย ลดยอดเงิน
    } else if (categoryExists.type.name === 'Income') {
      // รายรับ เพิ่มยอดเงิน (ใช้ค่าบวกอยู่แล้ว)
    } else if (categoryExists.type.name === 'Transfer') {
      // Transfer: ลดจากบัญชีต้นทาง เพิ่มในบัญชีปลายทาง
      balanceChange = -balanceChange; // ลดจากบัญชีต้นทาง
    }

    await prisma.accounts.update({
      where: { id: account_id },
      data: {
        amount: {
          increment: balanceChange,
        },
        updated_at: BigInt(Date.now()),
      },
    });

    // ถ้าเป็น Transfer ต้องเพิ่มยอดเงินในบัญชีปลายทาง
    if (categoryExists.type.name === 'Transfer' && related_account_id) {
      await prisma.accounts.update({
        where: { id: related_account_id },
        data: {
          amount: {
            increment: parseFloat(amount), // เพิ่มยอดเงินในบัญชีปลายทาง
          },
          updated_at: BigInt(Date.now()),
        },
      });
    }

    // แปลง BigInt เป็น string
    const serializedTransaction = {
      ...newTransaction,
      id: newTransaction.id,
      amount: newTransaction.amount.toString(),
      user_id: newTransaction.user_id,
      account_id: newTransaction.account_id,
      category_id: newTransaction.category_id,
      type_id: newTransaction.type_id,
      related_account_id: newTransaction.related_account_id,
      date: newTransaction.date.toString(),
      created_at: newTransaction.created_at?.toString(),
      updated_at: newTransaction.updated_at?.toString(),
      account: {
        ...newTransaction.account,
        id: newTransaction.account.id,
        user_id: newTransaction.account.user_id,
        amount: newTransaction.account.amount.toString(),
        created_at: newTransaction.account.created_at?.toString(),
        updated_at: newTransaction.account.updated_at?.toString(),
        deleted_at: newTransaction.account.deleted_at?.toString(),
      },
      category: {
        ...newTransaction.category,
        id: newTransaction.category.id,
        user_id: newTransaction.category.user_id,
        type_id: newTransaction.category.type_id,
        created_at: newTransaction.category.created_at?.toString(),
        updated_at: newTransaction.category.updated_at?.toString(),
        deleted_at: newTransaction.category.deleted_at?.toString(),
        type: {
          ...newTransaction.category.type,
          id: newTransaction.category.type.id,
          created_at: newTransaction.category.type.created_at?.toString(),
          updated_at: newTransaction.category.type.updated_at?.toString(),
        },
      },
      type: {
        ...newTransaction.type,
        id: newTransaction.type.id,
        created_at: newTransaction.type.created_at?.toString(),
        updated_at: newTransaction.type.updated_at?.toString(),
      },
      related_account: newTransaction.related_account ? {
        ...newTransaction.related_account,
        id: newTransaction.related_account.id,
        user_id: newTransaction.related_account.user_id,
        amount: newTransaction.related_account.amount.toString(),
        created_at: newTransaction.related_account.created_at?.toString(),
        updated_at: newTransaction.related_account.updated_at?.toString(),
        deleted_at: newTransaction.related_account.deleted_at?.toString(),
      } : null,
    };

    res.status(201).json({
      success: true,
      data: serializedTransaction,
      message: 'สร้างธุรกรรมสำเร็จ',
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างธุรกรรม',
      error: error.message,
    });
  }
};

/**
 * อัปเดตธุรกรรม
 * PUT /api/transactions/:id
 */
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { amount, description, date, transaction_date, account_id, category_id, related_account_id } = req.body;

    // รองรับทั้ง date และ transaction_date (เพื่อ backward compatibility)
    const transactionDate = date || transaction_date;

    console.log(`Updating transaction: ${transactionId} for user: ${userId}`);

    // ตรวจสอบว่าธุรกรรมมีอยู่และเป็นของผู้ใช้คนนี้
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id: transactionId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบธุรกรรมที่ระบุ',
      });
    }

    // สร้าง object สำหรับการอัปเดต
    const updateData = {
      updated_at: BigInt(Date.now()),
    };

    if (amount !== undefined) {
      updateData.amount = parseFloat(amount);
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (transactionDate !== undefined) {
      updateData.date = BigInt(new Date(transactionDate).getTime());
    }
    if (account_id !== undefined) {
      updateData.account_id = account_id;
    }
    if (category_id !== undefined) {
      updateData.category_id = category_id;
    }
    if (related_account_id !== undefined) {
      updateData.related_account_id = related_account_id;
    }

    // อัปเดตธุรกรรม
    const updatedTransaction = await prisma.transactions.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        account: true,
        category: {
          include: {
            type: true,
          },
        },
        type: true,
        related_account: true,
      },
    });

    // แปลง BigInt เป็น string
    const serializedTransaction = {
      ...updatedTransaction,
      id: updatedTransaction.id,
      amount: updatedTransaction.amount.toString(),
      user_id: updatedTransaction.user_id,
      account_id: updatedTransaction.account_id,
      category_id: updatedTransaction.category_id,
      type_id: updatedTransaction.type_id,
      related_account_id: updatedTransaction.related_account_id,
      date: updatedTransaction.date.toString(),
      created_at: updatedTransaction.created_at?.toString(),
      updated_at: updatedTransaction.updated_at?.toString(),
      account: {
        ...updatedTransaction.account,
        id: updatedTransaction.account.id,
        user_id: updatedTransaction.account.user_id,
        amount: updatedTransaction.account.amount.toString(),
        created_at: updatedTransaction.account.created_at?.toString(),
        updated_at: updatedTransaction.account.updated_at?.toString(),
        deleted_at: updatedTransaction.account.deleted_at?.toString(),
      },
      category: {
        ...updatedTransaction.category,
        id: updatedTransaction.category.id,
        user_id: updatedTransaction.category.user_id,
        type_id: updatedTransaction.category.type_id,
        created_at: updatedTransaction.category.created_at?.toString(),
        updated_at: updatedTransaction.category.updated_at?.toString(),
        deleted_at: updatedTransaction.category.deleted_at?.toString(),
        type: {
          ...updatedTransaction.category.type,
          id: updatedTransaction.category.type.id,
          created_at: updatedTransaction.category.type.created_at?.toString(),
          updated_at: updatedTransaction.category.type.updated_at?.toString(),
        },
      },
      type: {
        ...updatedTransaction.type,
        id: updatedTransaction.type.id,
        created_at: updatedTransaction.type.created_at?.toString(),
        updated_at: updatedTransaction.type.updated_at?.toString(),
      },
      related_account: updatedTransaction.related_account ? {
        ...updatedTransaction.related_account,
        id: updatedTransaction.related_account.id,
        user_id: updatedTransaction.related_account.user_id,
        amount: updatedTransaction.related_account.amount.toString(),
        created_at: updatedTransaction.related_account.created_at?.toString(),
        updated_at: updatedTransaction.related_account.updated_at?.toString(),
        deleted_at: updatedTransaction.related_account.deleted_at?.toString(),
      } : null,
    };

    res.json({
      success: true,
      data: serializedTransaction,
      message: 'อัปเดตธุรกรรมสำเร็จ',
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตธุรกรรม',
      error: error.message,
    });
  }
};

/**
 * ลบธุรกรรม (Soft Delete)
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    console.log(`Deleting transaction: ${transactionId} for user: ${userId}`);

    // ตรวจสอบว่าธุรกรรมมีอยู่และเป็นของผู้ใช้คนนี้
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id: transactionId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบธุรกรรมที่ระบุ',
      });
    }

    // Soft delete
    await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        deleted_at: BigInt(Date.now()),
        updated_at: BigInt(Date.now()),
      },
    });

    res.json({
      success: true,
      message: 'ลบธุรกรรมสำเร็จ',
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบธุรกรรม',
      error: error.message,
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};