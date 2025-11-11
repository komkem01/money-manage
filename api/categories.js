const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
});

const authenticate = (handler) => async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'ไม่พบ token' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'ไม่พบผู้ใช้' });
    }

    req.user = userResult.rows[0];
    req.userId = decoded.userId;
    
    return handler(req, res);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token ไม่ถูกต้อง' });
  }
};

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return authenticate(async (req, res) => {
    const userId = req.user.id;

    try {
      // GET - ดึงหมวดหมู่ทั้งหมด
      if (req.method === 'GET') {
        const result = await pool.query(
          `SELECT c.*, t.name as type_name
           FROM categories c
           JOIN types t ON c.type_id = t.id
           WHERE c.user_id = $1 AND c.deleted_at IS NULL
           ORDER BY c.created_at DESC`,
          [userId]
        );

        const categories = result.rows.map(cat => ({
          ...cat,
          created_at: cat.created_at ? cat.created_at.toString() : null,
          updated_at: cat.updated_at ? cat.updated_at.toString() : null,
          type: { id: cat.type_id, name: cat.type_name }
        }));

        return res.json({ success: true, data: categories });
      }

      // POST - สร้างหมวดหมู่ใหม่
      if (req.method === 'POST') {
        const { name, type_id } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อหมวดหมู่' });
        }

        if (!type_id) {
          return res.status(400).json({ success: false, message: 'กรุณาระบุประเภท' });
        }

        // ตรวจสอบชื่อซ้ำ
        const existingResult = await pool.query(
          'SELECT id FROM categories WHERE user_id = $1 AND type_id = $2 AND name = $3 AND deleted_at IS NULL',
          [userId, type_id, name.trim()]
        );

        if (existingResult.rows.length > 0) {
          return res.status(400).json({ success: false, message: 'มีหมวดหมู่ชื่อนี้อยู่แล้ว' });
        }

        const now = Date.now().toString();
        const newCategoryResult = await pool.query(
          `INSERT INTO categories (name, user_id, type_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [name.trim(), userId, type_id, now, now]
        );

        const newCategory = newCategoryResult.rows[0];

        return res.status(201).json({
          success: true,
          message: 'สร้างหมวดหมู่สำเร็จ',
          data: {
            ...newCategory,
            created_at: newCategory.created_at ? newCategory.created_at.toString() : null,
            updated_at: newCategory.updated_at ? newCategory.updated_at.toString() : null
          }
        });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
      console.error('Categories API error:', error);
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
  })(req, res);
};

module.exports = handler;
