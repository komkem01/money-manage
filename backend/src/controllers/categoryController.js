const prisma = require('../utils/prisma');

/**
 * ดึงหมวดหมู่ทั้งหมดของผู้ใช้ตาม type
 */
const getCategoriesByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { typeId } = req.params;

    // ตรวจสอบว่า type นี้มีอยู่จริง
    const typeExists = await prisma.types.findUnique({
      where: { id: typeId }
    });

    if (!typeExists) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบประเภทที่ระบุ'
      });
    }

    const categories = await prisma.categories.findMany({
      where: {
        user_id: userId,
        type_id: typeId,
        deleted_at: null
      },
      include: {
        type: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // แปลง BigInt เป็น string สำหรับ JSON serialization
    const serializedCategories = categories.map(category => ({
      ...category,
      id: category.id.toString(),
      user_id: category.user_id.toString(),
      type_id: category.type_id.toString(),
      created_at: category.created_at ? category.created_at.toString() : null,
      updated_at: category.updated_at ? category.updated_at.toString() : null,
      deleted_at: category.deleted_at ? category.deleted_at.toString() : null,
      type: {
        ...category.type,
        id: category.type.id.toString()
      }
    }));

    res.json({
      success: true,
      data: serializedCategories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
    });
  }
};

/**
 * ดึงหมวดหมู่ทั้งหมดของผู้ใช้
 */
const getAllCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const categories = await prisma.categories.findMany({
      where: {
        user_id: userId,
        deleted_at: null
      },
      include: {
        type: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // แปลง BigInt เป็น string สำหรับ JSON serialization
    const serializedCategories = categories.map(category => ({
      ...category,
      id: category.id.toString(),
      user_id: category.user_id.toString(),
      type_id: category.type_id.toString(),
      created_at: category.created_at ? category.created_at.toString() : null,
      updated_at: category.updated_at ? category.updated_at.toString() : null,
      deleted_at: category.deleted_at ? category.deleted_at.toString() : null,
      type: {
        ...category.type,
        id: category.type.id.toString()
      }
    }));

    res.json({
      success: true,
      data: serializedCategories
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
    });
  }
};

/**
 * สร้างหมวดหมู่ใหม่
 */
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type_id } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อหมวดหมู่'
      });
    }

    if (!type_id) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุประเภท'
      });
    }

    // ตรวจสอบว่า type นี้มีอยู่จริง
    const typeExists = await prisma.types.findUnique({
      where: { id: type_id }
    });

    if (!typeExists) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบประเภทที่ระบุ'
      });
    }

    // ตรวจสอบว่ามีหมวดหมู่ชื่อนี้ในประเภทเดียวกันแล้วหรือไม่
    const existingCategory = await prisma.categories.findFirst({
      where: {
        user_id: userId,
        type_id: type_id,
        name: name.trim(),
        deleted_at: null
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'มีหมวดหมู่ชื่อนี้ในประเภทนี้อยู่แล้ว'
      });
    }

    // สร้างหมวดหมู่ใหม่
    const newCategory = await prisma.categories.create({
      data: {
        name: name.trim(),
        user_id: userId,
        type_id: type_id,
        created_at: BigInt(Date.now()),
        updated_at: BigInt(Date.now())
      },
      include: {
        type: true
      }
    });

    // แปลง BigInt เป็น string
    const serializedCategory = {
      ...newCategory,
      id: newCategory.id.toString(),
      user_id: newCategory.user_id.toString(),
      type_id: newCategory.type_id.toString(),
      created_at: newCategory.created_at.toString(),
      updated_at: newCategory.updated_at.toString(),
      type: {
        ...newCategory.type,
        id: newCategory.type.id.toString()
      }
    };

    res.status(201).json({
      success: true,
      message: 'สร้างหมวดหมู่สำเร็จ',
      data: serializedCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่'
    });
  }
};

/**
 * อัปเดตหมวดหมู่
 */
const updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, type_id } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อหมวดหมู่'
      });
    }

    if (!type_id) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุประเภท'
      });
    }

    // ตรวจสอบว่าหมวดหมู่เป็นของผู้ใช้หรือไม่
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id: id,
        user_id: userId,
        deleted_at: null
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข'
      });
    }

    // ตรวจสอบว่า type นี้มีอยู่จริง
    const typeExists = await prisma.types.findUnique({
      where: { id: type_id }
    });

    if (!typeExists) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบประเภทที่ระบุ'
      });
    }

    // ตรวจสอบว่ามีหมวดหมู่ชื่อซ้ำหรือไม่ (ยกเว้นหมวดหมู่ที่กำลังแก้ไข)
    const duplicateCategory = await prisma.categories.findFirst({
      where: {
        user_id: userId,
        type_id: type_id,
        name: name.trim(),
        deleted_at: null,
        id: {
          not: id
        }
      }
    });

    if (duplicateCategory) {
      return res.status(400).json({
        success: false,
        message: 'มีหมวดหมู่ชื่อนี้ในประเภทนี้อยู่แล้ว'
      });
    }

    // อัปเดตหมวดหมู่
    const updatedCategory = await prisma.categories.update({
      where: {
        id: id
      },
      data: {
        name: name.trim(),
        type_id: type_id,
        updated_at: BigInt(Date.now())
      },
      include: {
        type: true
      }
    });

    // แปลง BigInt เป็น string
    const serializedCategory = {
      ...updatedCategory,
      id: updatedCategory.id.toString(),
      user_id: updatedCategory.user_id.toString(),
      type_id: updatedCategory.type_id.toString(),
      created_at: updatedCategory.created_at ? updatedCategory.created_at.toString() : null,
      updated_at: updatedCategory.updated_at.toString(),
      type: {
        ...updatedCategory.type,
        id: updatedCategory.type.id.toString()
      }
    };

    res.json({
      success: true,
      message: 'อัปเดตหมวดหมู่สำเร็จ',
      data: serializedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่'
    });
  }
};

/**
 * ลบหมวดหมู่ (Soft Delete)
 */
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // ตรวจสอบว่าหมวดหมู่เป็นของผู้ใช้หรือไม่
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id: id,
        user_id: userId,
        deleted_at: null
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบหมวดหมู่ที่ต้องการลบ'
      });
    }

    // ตรวจสอบว่ามีรายการทำธุรกรรมที่ใช้หมวดหมู่นี้หรือไม่
    const relatedTransactions = await prisma.transactions.findFirst({
      where: {
        category_id: id,
        deleted_at: null
      }
    });

    if (relatedTransactions) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบหมวดหมู่ได้ เนื่องจากมีธุรกรรมที่ใช้หมวดหมู่นี้'
      });
    }

    // ลบหมวดหมู่ (Soft Delete)
    await prisma.categories.update({
      where: {
        id: id
      },
      data: {
        deleted_at: BigInt(Date.now())
      }
    });

    res.json({
      success: true,
      message: 'ลบหมวดหมู่สำเร็จ'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบหมวดหมู่'
    });
  }
};

/**
 * ดึงหมวดหมู่เดียว
 */
const getCategoryById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const category = await prisma.categories.findFirst({
      where: {
        id: id,
        user_id: userId,
        deleted_at: null
      },
      include: {
        type: true
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบหมวดหมู่ที่ต้องการ'
      });
    }

    // แปลง BigInt เป็น string
    const serializedCategory = {
      ...category,
      id: category.id.toString(),
      user_id: category.user_id.toString(),
      type_id: category.type_id.toString(),
      created_at: category.created_at ? category.created_at.toString() : null,
      updated_at: category.updated_at ? category.updated_at.toString() : null,
      type: {
        ...category.type,
        id: category.type.id.toString()
      }
    };

    res.json({
      success: true,
      data: serializedCategory
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
    });
  }
};

module.exports = {
  getCategoriesByType,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
};