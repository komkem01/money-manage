const jwt = require('jsonwebtoken');
const { getClient } = require('../_db');

const normalizeTransactionDate = (input, { fallbackToNow = true } = {}) => {
  if (input === undefined) {
    return fallbackToNow ? Date.now() : undefined;
  }

  if (input === null) {
    return fallbackToNow ? Date.now() : null;
  }

  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : NaN;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return fallbackToNow ? Date.now() : null;
    }

    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : NaN;
    }

    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? NaN : parsed;
  }

  if (input instanceof Date) {
    const time = input.getTime();
    return Number.isNaN(time) ? NaN : time;
  }

  return NaN;
};

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return authenticate(async (req, res) => {
    const userId = req.user.id;
    const client = req.client;

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
        const normalizedTransactionDate = transactionDate !== undefined ? normalizeTransactionDate(transactionDate) : undefined;

        console.log('Creating transaction - debug info:', {
          amount, 
          description, 
          date, 
          transaction_date,
          transactionDate, 
          account_id, 
          category_id, 
          related_account_id,
          amountType: typeof amount,
          dateType: typeof transactionDate,
          parsedAmount: parseFloat(amount),
          dateString: transactionDate,
          normalizedTransactionDate,
          isDateValid: normalizedTransactionDate === undefined ? 'no date to validate' : !Number.isNaN(normalizedTransactionDate)
        });

        // Validation
        const amountValue = parseFloat(amount);
        if (!amount || isNaN(amountValue) || amountValue <= 0) {
          return res.status(400).json({
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ กรุณาระบุจำนวนเงินที่ถูกต้อง',
            field: 'amount'
          });
        }

        if (!account_id) {
          return res.status(400).json({
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ กรุณาเลือกบัญชี',
            field: 'account_id'
          });
        }

        if (!category_id) {
          return res.status(400).json({
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ กรุณาเลือกหมวดหมู่',
            field: 'category_id'
          });
        }

        // Validate date if provided
        if (transactionDate !== undefined && Number.isNaN(normalizedTransactionDate)) {
          return res.status(400).json({
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ วันที่ไม่ถูกต้อง',
            field: 'date'
          });
        }

        await client.query('BEGIN');

        try {
          // ตรวจสอบ account
          const accountResult = await client.query(
            'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [account_id, userId]
          );

          if (accountResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
              success: false,
              error: 'ACCOUNT_NOT_FOUND', 
              message: '❌ ไม่พบบัญชีที่ระบุ',
              field: 'account_id' 
            });
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
            return res.status(404).json({ 
              success: false,
              error: 'CATEGORY_NOT_FOUND', 
              message: '❌ ไม่พบหมวดหมู่ที่ระบุ',
              field: 'category_id' 
            });
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
                error: 'INSUFFICIENT_BALANCE',
                message: `⚠️ ยอดเงินในบัญชี "${account.name}" ไม่เพียงพอ (คงเหลือ: ${currentBalance.toLocaleString()} บาท, ต้องการ: ${requestAmount.toLocaleString()} บาท)`,
                field: 'amount',
                currentBalance: currentBalance,
                requiredAmount: requestAmount
              });
            }
          }

          // ตรวจสอบ related_account สำหรับ Transfer
          if (category.type_name === 'Transfer') {
            if (!related_account_id) {
              await client.query('ROLLBACK');
              return res.status(400).json({ 
                success: false,
                error: 'VALIDATION_ERROR', 
                message: '❌ กรุณาเลือกบัญชีปลายทางสำหรับการโอนเงิน',
                field: 'related_account_id' 
              });
            }

            if (related_account_id === account_id) {
              await client.query('ROLLBACK');
              return res.status(400).json({ 
                success: false,
                error: 'VALIDATION_ERROR', 
                message: '❌ ไม่สามารถโอนเงินภายในบัญชีเดียวกันได้',
                field: 'related_account_id' 
              });
            }

            const relatedResult = await client.query(
              'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
              [related_account_id, userId]
            );

            if (relatedResult.rows.length === 0) {
              await client.query('ROLLBACK');
              return res.status(404).json({ 
                success: false,
                error: 'RELATED_ACCOUNT_NOT_FOUND', 
                message: '❌ ไม่พบบัญชีปลายทางที่ระบุ',
                field: 'related_account_id' 
              });
            }
          }

          // สร้างธุรกรรม
          const transactionAmount = Math.abs(parseFloat(amount));
          const now = Date.now().toString();

          let txDate = Number(now);
          if (transactionDate !== undefined) {
            if (Number.isNaN(normalizedTransactionDate)) {
              await client.query('ROLLBACK');
              return res.status(400).json({ 
                success: false,
                error: 'INVALID_DATE', 
                message: '❌ วันที่ของธุรกรรมไม่ถูกต้อง',
                field: 'date' 
              });
            }

            txDate = normalizedTransactionDate;
          }

          txDate = txDate.toString();

          const newTransactionResult = await client.query(
            `INSERT INTO transactions (amount, description, date, user_id, type_id, account_id, category_id, related_account_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [transactionAmount, description || null, txDate, userId, category.type_id, account_id, category_id, related_account_id || null, now, now]
          );

          // อัปเดตยอดเงินในบัญชี
          let balanceChange = transactionAmount;

          if (category.type_name === 'Expense' || category.type_name === 'Transfer') {
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
              [transactionAmount, now, related_account_id]
            );
          }

          await client.query('COMMIT');

          const newTransaction = newTransactionResult.rows[0];

          return res.status(201).json({
            success: true,
            message: '✅ สร้างธุรกรรมสำเร็จ',
            data: {
              ...newTransaction,
              date: newTransaction.date ? newTransaction.date.toString() : null,
              created_at: newTransaction.created_at ? newTransaction.created_at.toString() : null,
              updated_at: newTransaction.updated_at ? newTransaction.updated_at.toString() : null
            }
          });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      }

      return res.status(405).json({ 
        success: false,
        error: 'METHOD_NOT_ALLOWED',
        message: `❌ Method ${req.method} ไม่ได้รับอนุญาต กรุณาใช้ GET หรือ POST`,
        allowedMethods: ['GET', 'POST']
      });
    } catch (error) {
      console.error('Transactions API error:', error);
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
