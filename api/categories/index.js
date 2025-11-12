const jwt = require('jsonwebtoken');
const { getClient } = require('../_db');

const authenticate = (handler) => async (req, res) => {
  const client = await getClient();
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'UNAUTHORIZED',
        message: '⚠️ ไม่พบ Token สำหรับยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await client.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'USER_NOT_FOUND', 
        message: '⚠️ ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' 
      });
    }

    req.user = userResult.rows[0];
    req.userId = decoded.userId;
    req.client = client;
    
    return await handler(req, res);
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'INVALID_TOKEN', 
      message: '⚠️ Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่' 
    });
  } finally {
    client.release();
  }
};

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return authenticate(async (req, res) => {
    const userId = req.user.id;
    const client = req.client;

    try {
      // GET - ดึงรายการหมวดหมู่ทั้งหมด (จัดกลุ่มตามประเภท)
      if (req.method === 'GET') {
        const result = await client.query(
          `SELECT c.*, t.name as type_name, t.id as type_id
           FROM categories c
           JOIN types t ON c.type_id = t.id
           WHERE c.user_id = $1 AND c.deleted_at IS NULL
           ORDER BY t.name, c.created_at DESC`,
          [userId]
        );

        const categories = result.rows.map(cat => ({
          id: cat.id,
          name: cat.name,
          user_id: cat.user_id,
          type_id: cat.type_id,
          created_at: cat.created_at ? cat.created_at.toString() : null,
          updated_at: cat.updated_at ? cat.updated_at.toString() : null,
          type: { 
            id: cat.type_id, 
            name: cat.type_name 
          }
        }));

        // จัดกลุ่มตาม type
        const grouped = categories.reduce((acc, cat) => {
          const typeName = cat.type.name;
          if (!acc[typeName]) {
            acc[typeName] = [];
          }
          acc[typeName].push(cat);
          return acc;
        }, {});

        return res.json({ 
          success: true, 
          data: categories,
          grouped: grouped,
          count: categories.length 
        });
      }

      // POST - สร้างหมวดหมู่ใหม่
      if (req.method === 'POST') {
        const { name, type_id } = req.body;

        // Validation
        if (!name || !name.trim()) {
          return res.status(400).json({ 
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ กรุณากรอกชื่อหมวดหมู่',
            field: 'name' 
          });
        }

        if (!type_id) {
          return res.status(400).json({ 
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ กรุณาระบุประเภท (Income, Expense, Transfer)',
            field: 'type_id' 
          });
        }

        // ตรวจสอบว่า type มีอยู่จริง
        const typeResult = await client.query(
          'SELECT * FROM types WHERE id = $1',
          [type_id]
        );

        if (typeResult.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'TYPE_NOT_FOUND',
            message: '❌ ไม่พบประเภทที่ระบุ',
            field: 'type_id' 
          });
        }

        const typeName = typeResult.rows[0].name;

        // ตรวจสอบชื่อซ้ำในประเภทเดียวกัน
        const existingResult = await client.query(
          'SELECT id, name FROM categories WHERE user_id = $1 AND type_id = $2 AND LOWER(name) = LOWER($3) AND deleted_at IS NULL',
          [userId, type_id, name.trim()]
        );

        if (existingResult.rows.length > 0) {
          return res.status(409).json({ 
            success: false,
            error: 'DUPLICATE_NAME',
            message: `⚠️ มีหมวดหมู่ "${name.trim()}" ในประเภท "${typeName}" อยู่แล้ว กรุณาใช้ชื่ออื่น`,
            field: 'name',
            existingCategory: {
              id: existingResult.rows[0].id,
              name: existingResult.rows[0].name,
              type: typeName
            }
          });
        }

        const now = Date.now().toString();
        const newCategoryResult = await client.query(
          `INSERT INTO categories (name, user_id, type_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [name.trim(), userId, type_id, now, now]
        );

        const newCategory = newCategoryResult.rows[0];

        return res.status(201).json({
          success: true,
          message: '✅ สร้างหมวดหมู่สำเร็จ',
          data: {
            ...newCategory,
            created_at: newCategory.created_at ? newCategory.created_at.toString() : null,
            updated_at: newCategory.updated_at ? newCategory.updated_at.toString() : null,
            type: {
              id: type_id,
              name: typeName
            }
          }
        });
      }

      return res.status(405).json({ 
        success: false,
        error: 'METHOD_NOT_ALLOWED',
        message: `❌ Method ${req.method} ไม่ได้รับอนุญาต กรุณาใช้ GET หรือ POST`,
        allowedMethods: ['GET', 'POST']
      });
    } catch (error) {
      console.error('Categories API error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'INTERNAL_SERVER_ERROR', 
        message: '❌ เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })(req, res);
};

module.exports = handler;
