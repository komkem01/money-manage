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
    const client = await pool.connect();

    try {
      // GET - ดึงธุรกรรมทั้งหมด
      if (req.method === 'GET') {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const countResult = await client.query(
          'SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND deleted_at IS NULL',
          [userId]
        );
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await client.query(
          `SELECT 
            t.*,
            a.name as account_name,
            a.amount as account_balance,
            ra.name as related_account_name,
            c.name as category_name,
            ty.name as type_name
           FROM transactions t
           JOIN accounts a ON t.account_id = a.id
           LEFT JOIN accounts ra ON t.related_account_id = ra.id
           JOIN categories c ON t.category_id = c.id
           JOIN types ty ON t.type_id = ty.id
           WHERE t.user_id = $1 AND t.deleted_at IS NULL
           ORDER BY t.date DESC, t.created_at DESC
           LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
        );

        const transactions = result.rows.map(t => ({
          ...t,
          date: t.date ? t.date.toString() : null,
          created_at: t.created_at ? t.created_at.toString() : null,
          updated_at: t.updated_at ? t.updated_at.toString() : null,
          account: { id: t.account_id, name: t.account_name, amount: t.account_balance },
          category: { id: t.category_id, name: t.category_name, type: { name: t.type_name } },
          type: { id: t.type_id, name: t.type_name },
          related_account: t.related_account_id ? { id: t.related_account_id, name: t.related_account_name } : null
        }));

        return res.json({
          success: true,
          data: transactions,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: limit,
          },
        });
      }

      // POST - สร้างธุรกรรมใหม่
      if (req.method === 'POST') {
        const { amount, description, date, transaction_date, account_id, category_id, related_account_id } = req.body;
        const transactionDate = date || transaction_date;

        if (!amount || !account_id || !category_id) {
          return res.status(400).json({
            success: false,
            message: 'กรุณาระบุข้อมูลที่จำเป็น: จำนวนเงิน, บัญชี, และหมวดหมู่',
          });
        }

        await client.query('BEGIN');

        // ตรวจสอบ account
        const accountResult = await client.query(
          'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
          [account_id, userId]
        );

        if (accountResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: 'ไม่พบบัญชีที่ระบุ' });
        }

        // ตรวจสอบ category และ type
        const categoryResult = await client.query(
          `SELECT c.*, t.name as type_name FROM categories c
           JOIN types t ON c.type_id = t.id
           WHERE c.id = $1 AND c.user_id = $2 AND c.deleted_at IS NULL`,
          [category_id, userId]
        );

        if (categoryResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: 'ไม่พบหมวดหมู่ที่ระบุ' });
        }

        const category = categoryResult.rows[0];
        const account = accountResult.rows[0];

        // ตรวจสอบยอดเงินสำหรับ Expense และ Transfer
        if (category.type_name === 'Transfer' || category.type_name === 'Expense') {
          const currentBalance = parseFloat(account.amount);
          const requestAmount = parseFloat(amount);
          
          if (currentBalance < requestAmount) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              success: false,
              message: `ยอดเงินในบัญชี "${account.name}" ไม่เพียงพอ (คงเหลือ: ${currentBalance} บาท)`,
            });
          }
        }

        // ตรวจสอบ related_account สำหรับ Transfer
        if (related_account_id) {
          const relatedResult = await client.query(
            'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [related_account_id, userId]
          );

          if (relatedResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'ไม่พบบัญชีปลายทาง' });
          }
        }

        // สร้างธุรกรรม
        const transactionAmount = category.type_name === 'Transfer' ? Math.abs(parseFloat(amount)) : parseFloat(amount);
        const now = Date.now().toString();
        const txDate = transactionDate ? new Date(transactionDate).getTime().toString() : now;

        const newTransactionResult = await client.query(
          `INSERT INTO transactions (amount, description, date, user_id, type_id, account_id, category_id, related_account_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [transactionAmount, description || null, txDate, userId, category.type_id, account_id, category_id, related_account_id || null, now, now]
        );

        // อัปเดตยอดเงินในบัญชี
        let balanceChange = parseFloat(amount);

        if (category.type_name === 'Expense') {
          balanceChange = -balanceChange;
        } else if (category.type_name === 'Transfer') {
          balanceChange = -balanceChange;
        }

        await client.query(
          'UPDATE accounts SET amount = amount + $1, updated_at = $2 WHERE id = $3',
          [balanceChange, now, account_id]
        );

        // ถ้าเป็น Transfer ต้องเพิ่มยอดเงินในบัญชีปลายทาง
        if (category.type_name === 'Transfer' && related_account_id) {
          await client.query(
            'UPDATE accounts SET amount = amount + $1, updated_at = $2 WHERE id = $3',
            [parseFloat(amount), now, related_account_id]
          );
        }

        await client.query('COMMIT');

        const newTransaction = newTransactionResult.rows[0];

        return res.status(201).json({
          success: true,
          data: {
            ...newTransaction,
            date: newTransaction.date ? newTransaction.date.toString() : null,
            created_at: newTransaction.created_at ? newTransaction.created_at.toString() : null,
            updated_at: newTransaction.updated_at ? newTransaction.updated_at.toString() : null
          },
          message: 'สร้างธุรกรรมสำเร็จ',
        });
      }

      return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transactions API error:', error);
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error: error.message });
    } finally {
      client.release();
    }
  })(req, res);
};

module.exports = handler;
