const prisma = require('../utils/prisma');

/**
 * ดึงบัญชีทั้งหมดของผู้ใช้
 */
const getAllAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await prisma.accounts.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // แปลง BigInt เป็น string สำหรับ JSON serialization
    const serializedAccounts = accounts.map(account => ({
      ...account,
      id: account.id.toString(),
      user_id: account.user_id.toString(),
      balance: account.amount.toString(),  // Map amount to balance for frontend
      amount: account.amount.toString(),   // Keep original field for backward compatibility
      created_at: account.created_at ? account.created_at.toString() : null,
      updated_at: account.updated_at ? account.updated_at.toString() : null
    }));

    res.json({
      success: true,
      data: serializedAccounts
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี'
    });
  }
};

/**
 * สร้างบัญชีใหม่
 */
const createAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, initial_balance } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อบัญชี'
      });
    }

    if (initial_balance === undefined || initial_balance === null) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกยอดเงินเริ่มต้น'
      });
    }

    // ตรวจสอบว่ามีบัญชีชื่อนี้แล้วหรือไม่
    const existingAccount = await prisma.accounts.findFirst({
      where: {
        user_id: userId,
        name: name.trim()
      }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'มีบัญชีชื่อนี้อยู่แล้ว'
      });
    }

    // สร้างบัญชีใหม่
    const newAccount = await prisma.accounts.create({
      data: {
        name: name.trim(),
        amount: parseFloat(initial_balance),
        user_id: userId,
        created_at: BigInt(Date.now()),
        updated_at: BigInt(Date.now())
      }
    });

    // แปลง BigInt เป็น string
    const serializedAccount = {
      ...newAccount,
      id: newAccount.id.toString(),
      user_id: newAccount.user_id.toString(),
      balance: newAccount.amount.toString(),  // Map amount to balance for frontend
      amount: newAccount.amount.toString(),   // Keep original field for backward compatibility
      created_at: newAccount.created_at ? newAccount.created_at.toString() : null,
      updated_at: newAccount.updated_at ? newAccount.updated_at.toString() : null
    };

    res.status(201).json({
      success: true,
      message: 'สร้างบัญชีสำเร็จ',
      data: serializedAccount
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างบัญชี'
    });
  }
};

/**
 * อัปเดตบัญชี
 */
const updateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, initial_balance } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อบัญชี'
      });
    }

    if (initial_balance === undefined || initial_balance === null) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกยอดเงินเริ่มต้น'
      });
    }

    // ตรวจสอบว่าบัญชีเป็นของผู้ใช้หรือไม่
    const existingAccount = await prisma.accounts.findFirst({
      where: {
        id: id,
        user_id: userId
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบัญชีที่ต้องการแก้ไข'
      });
    }

    // ตรวจสอบว่ามีบัญชีชื่อซ้ำหรือไม่ (ยกเว้นบัญชีที่กำลังแก้ไข)
    const duplicateAccount = await prisma.accounts.findFirst({
      where: {
        user_id: userId,
        name: name.trim(),
        id: {
          not: id
        }
      }
    });

    if (duplicateAccount) {
      return res.status(400).json({
        success: false,
        message: 'มีบัญชีชื่อนี้อยู่แล้ว'
      });
    }

    // อัปเดตบัญชี
    const updatedAccount = await prisma.accounts.update({
      where: {
        id: id
      },
      data: {
        name: name.trim(),
        amount: parseFloat(initial_balance),
        updated_at: BigInt(Date.now())
      }
    });

    // แปลง BigInt เป็น string
    const serializedAccount = {
      ...updatedAccount,
      id: updatedAccount.id.toString(),
      user_id: updatedAccount.user_id.toString(),
      balance: updatedAccount.amount.toString(),  // Map amount to balance for frontend
      amount: updatedAccount.amount.toString(),   // Keep original field for backward compatibility
      created_at: updatedAccount.created_at ? updatedAccount.created_at.toString() : null,
      updated_at: updatedAccount.updated_at ? updatedAccount.updated_at.toString() : null
    };

    res.json({
      success: true,
      message: 'อัปเดตบัญชีสำเร็จ',
      data: serializedAccount
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตบัญชี'
    });
  }
};

/**
 * ลบบัญชี
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // ตรวจสอบว่าบัญชีเป็นของผู้ใช้หรือไม่
    const existingAccount = await prisma.accounts.findFirst({
      where: {
        id: id,
        user_id: userId
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบัญชีที่ต้องการลบ'
      });
    }

    // ตรวจสอบว่ามีธุรกรรมที่เกี่ยวข้องกับบัญชีนี้หรือไม่
    const relatedTransactions = await prisma.transactions.findFirst({
      where: {
        OR: [
          { account_id: id },
          { related_account_id: id }
        ]
      }
    });

    if (relatedTransactions) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบบัญชีได้ เนื่องจากมีธุรกรรมที่เกี่ยวข้อง'
      });
    }

    // ลบบัญชี
    await prisma.accounts.delete({
      where: {
        id: id
      }
    });

    res.json({
      success: true,
      message: 'ลบบัญชีสำเร็จ'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบบัญชี'
    });
  }
};

/**
 * ดึงบัญชีเดียว
 */
const getAccountById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const account = await prisma.accounts.findFirst({
      where: {
        id: id,
        user_id: userId
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบัญชีที่ต้องการ'
      });
    }

    // แปลง BigInt เป็น string
    const serializedAccount = {
      ...account,
      id: account.id.toString(),
      user_id: account.user_id.toString(),
      balance: account.amount.toString(),  // Map amount to balance for frontend
      amount: account.amount.toString(),   // Keep original field for backward compatibility
      created_at: account.created_at ? account.created_at.toString() : null,
      updated_at: account.updated_at ? account.updated_at.toString() : null
    };

    res.json({
      success: true,
      data: serializedAccount
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี'
    });
  }
};

module.exports = {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountById
};