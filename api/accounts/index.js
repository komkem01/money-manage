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
      // GET - ดึงบัญชีทั้งหมด
      if (req.method === 'GET') {
        const result = await client.query(
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
          data: accounts,
          count: accounts.length 
        });
      }

            // POST - สร้างบัญชีใหม่
      if (req.method === 'POST') {
        const { name, amount } = req.body;

        // Validation
        if (!name || !name.trim()) {
          return res.status(400).json({ 
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ กรุณากรอกชื่อบัญชี',
            field: 'name' 
          });
        }

        if (amount === undefined || amount === null) {
          return res.status(400).json({ 
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ กรุณาระบุยอดเงินเริ่มต้น',
            field: 'amount' 
          });
        }

        if (isNaN(parseFloat(amount))) {
          return res.status(400).json({ 
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ ยอดเงินต้องเป็นตัวเลขเท่านั้น',
            field: 'amount' 
          });
        }

        // ตรวจสอบชื่อซ้ำ
        const existingResult = await client.query(
          'SELECT id, name FROM accounts WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND deleted_at IS NULL',
          [userId, name.trim()]
        );

        if (existingResult.rows.length > 0) {
          return res.status(409).json({ 
            success: false,
            error: 'DUPLICATE_NAME',
            message: `⚠️ มีบัญชีชื่อ "${name.trim()}" อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`,
            field: 'name',
            existingAccount: {
              id: existingResult.rows[0].id,
              name: existingResult.rows[0].name
            }
          });
        }

        const now = Date.now().toString();
        const newAccountResult = await client.query(
          `INSERT INTO accounts (name, amount, user_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [name.trim(), parseFloat(amount), userId, now, now]
        );

        const newAccount = newAccountResult.rows[0];

        return res.status(201).json({
          success: true,
          message: '✅ สร้างบัญชีสำเร็จ',
          data: {
            ...newAccount,
            balance: newAccount.amount,
            created_at: newAccount.created_at ? newAccount.created_at.toString() : null,
            updated_at: newAccount.updated_at ? newAccount.updated_at.toString() : null
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
      console.error('Accounts API error:', error);
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
