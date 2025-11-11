const prisma = require('../utils/prisma');

/**
 * ดึงประเภททั้งหมด (Income, Expense, Transfer)
 */
const getAllTypes = async (req, res) => {
  try {
    const types = await prisma.types.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // แปลง BigInt เป็น string สำหรับ JSON serialization (ถ้ามี)
    const serializedTypes = types.map(type => ({
      ...type,
      id: type.id.toString(),
    }));

    res.json({
      success: true,
      data: serializedTypes
    });
  } catch (error) {
    console.error('Get types error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภท'
    });
  }
};

/**
 * ดึงประเภทเดียว
 */
const getTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const type = await prisma.types.findUnique({
      where: {
        id: id
      }
    });

    if (!type) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบประเภทที่ต้องการ'
      });
    }

    // แปลง BigInt เป็น string
    const serializedType = {
      ...type,
      id: type.id.toString(),
    };

    res.json({
      success: true,
      data: serializedType
    });
  } catch (error) {
    console.error('Get type error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภท'
    });
  }
};

module.exports = {
  getAllTypes,
  getTypeById
};