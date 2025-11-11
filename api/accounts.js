const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const getClient = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
};

const authenticate = (handler) => async (req, res) => {
  const client = await getClient();
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await client.end();
      return res.status(401).json({ success: false, message: 'ไม่พบ token' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await client.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      await client.end();
      return res.status(401).json({ success: false, message: 'ไม่พบผู้ใช้' });
    }

    req.user = userResult.rows[0];
    req.userId = decoded.userId;
    req.client = client;
    
    return handler(req, res);
  } catch (error) {
    console.error('Authentication error:', error);
    await client.end();
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
    const client = req.client;

    try {
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

        return res.json({ success: true, data: accounts });
      }

      if (req.method === 'POST') {
        const { name, initial_balance } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อบัญชี' });
        }

        if (initial_balance === undefined || initial_balance === null) {
          return res.status(400).json({ success: false, message: 'กรุณากรอกยอดเงินเริ่มต้น' });
        }

        const existingResult = await client.query(
          'SELECT id FROM accounts WHERE user_id = $1 AND name = $2 AND deleted_at IS NULL',
          [userId, name.trim()]
        );

        if (existingResult.rows.length > 0) {
          return res.status(400).json({ success: false, message: 'มีบัญชีชื่อนี้อยู่แล้ว' });
        }

        const now = Date.now().toString();
        const newAccountResult = await client.query(
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
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error: error.message });
    } finally {
      await client.end();
    }
  })(req, res);
};

module.exports = handler;
