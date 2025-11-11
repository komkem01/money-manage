const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// สร้าง connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware สำหรับตรวจสอบ JWT
const authenticate = (handler) => async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบ token หรือ token ไม่ถูกต้อง'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ดึงข้อมูล user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }

    req.user = userResult.rows[0];
    req.userId = decoded.userId;
    
    return handler(req, res);
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ'
    });
  }
};

// Handler function
const handler = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return authenticate(async (req, res) => {
    const userId = req.user.id;

    try {
      // GET /api/accounts - ดึงบัญชีทั้งหมด
      if (req.method === 'GET') {
        const result = await pool.query(
          `SELECT * FROM accounts 
           WHERE user_id = $1 AND deleted_at IS NULL
           ORDER BY created_at DESC`,
          [userId]
        );

        const accounts = result.rows.map(account => ({
          ...account,
          balance: account.amount,
          created_at: account.created_at ? account.created_at.toString() : null,
          updated_at: account.updated_at ? account.updated_at.toString() : null
        }));

        return res.json({
          success: true,
          data: accounts
        });
      }

      // POST /api/accounts - สร้างบัญชีใหม่
      if (req.method === 'POST') {
        const { name, initial_balance } = req.body;

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

        // ตรวจสอบชื่อซ้ำ
        const existingResult = await pool.query(
          'SELECT id FROM accounts WHERE user_id = $1 AND name = $2 AND deleted_at IS NULL',
          [userId, name.trim()]
        );

        if (existingResult.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'มีบัญชีชื่อนี้อยู่แล้ว'
          });
        }

        const now = Date.now().toString();
        const newAccountResult = await pool.query(
          `INSERT INTO accounts (name, amount, user_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [name.trim(), parseFloat(initial_balance), userId, now, now]
        );

        const newAccount = newAccountResult.rows[0];

        return res.status(201).json({
          success: true,
          message: 'สร้างบัญชีสำเร็จ',
          data: {
            ...newAccount,
            balance: newAccount.amount,
            created_at: newAccount.created_at ? newAccount.created_at.toString() : null,
            updated_at: newAccount.updated_at ? newAccount.updated_at.toString() : null
          }
        });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
      console.error('Accounts API error:', error);
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาด',
        error: error.message
      });
    }
  })(req, res);
};

module.exports = handler;
