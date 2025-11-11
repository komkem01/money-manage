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
      await client.end();
      return res.status(401).json({ 
        success: false,
        error: 'USER_NOT_FOUND', 
        message: '⚠️ ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' 
      });
    }

    req.user = userResult.rows[0];
    req.userId = decoded.userId;
    req.client = client;
    
    return handler(req, res);
  } catch (error) {
    console.error('Authentication error:', error);
    await client.end();
    return res.status(401).json({ 
      success: false,
      error: 'INVALID_TOKEN', 
      message: '⚠️ Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่' 
    });
  }
};

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // แยก account ID จาก URL path
  const accountId = req.query.id;

  if (!accountId) {
    return res.status(400).json({ 
      success: false,
      error: 'MISSING_ACCOUNT_ID',
      message: '❌ กรุณาระบุ ID ของบัญชี' 
    });
  }

  return authenticate(async (req, res) => {
    const userId = req.user.id;
    const client = req.client;

    try {
      // GET - ดึงบัญชีเดียว
      if (req.method === 'GET') {
        const result = await client.query(
          `SELECT * FROM accounts 
           WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
          [accountId, userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'ACCOUNT_NOT_FOUND',
            message: '❌ ไม่พบบัญชีที่ต้องการ' 
          });
        }

        const account = result.rows[0];

        return res.json({ 
          success: true, 
          data: {
            ...account,
            balance: account.amount,
            created_at: account.created_at ? account.created_at.toString() : null,
            updated_at: account.updated_at ? account.updated_at.toString() : null
          }
        });
      }

      // PATCH - แก้ไขบัญชี
      if (req.method === 'PATCH') {
        const { name, amount } = req.body;
        console.log('PATCH request received:', { accountId, userId, name, amount, body: req.body });

        // ตรวจสอบว่าบัญชีมีอยู่และเป็นของผู้ใช้
        const existingResult = await client.query(
          'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
          [accountId, userId]
        );

        if (existingResult.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'ACCOUNT_NOT_FOUND',
            message: '❌ ไม่พบบัญชีที่ต้องการแก้ไข' 
          });
        }

        const existingAccount = existingResult.rows[0];

        // Validation
        if (name !== undefined) {
          if (!name || !name.trim()) {
            return res.status(400).json({ 
              success: false,
              error: 'VALIDATION_ERROR',
              message: '❌ ชื่อบัญชีไม่สามารถเป็นค่าว่างได้',
              field: 'name' 
            });
          }

          // ตรวจสอบชื่อซ้ำ (ยกเว้นบัญชีที่กำลังแก้ไข)
          const duplicateResult = await client.query(
            'SELECT id, name FROM accounts WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND id != $3 AND deleted_at IS NULL',
            [userId, name.trim(), accountId]
          );

          if (duplicateResult.rows.length > 0) {
            return res.status(409).json({ 
              success: false,
              error: 'DUPLICATE_NAME',
              message: `⚠️ มีบัญชีชื่อ "${name.trim()}" อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`,
              field: 'name',
              existingAccount: {
                id: duplicateResult.rows[0].id,
                name: duplicateResult.rows[0].name
              }
            });
          }
        }

        if (amount !== undefined) {
          const parsedAmount = parseFloat(amount);
          if (isNaN(parsedAmount) || parsedAmount < 0) {
            return res.status(400).json({ 
              success: false,
              error: 'VALIDATION_ERROR',
              message: '❌ ยอดเงินต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0',
              field: 'amount' 
            });
          }
        }

        // สร้าง update query แบบ dynamic
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
          updates.push(`name = $${paramCount}`);
          values.push(name.trim());
          paramCount++;
        }

        if (amount !== undefined) {
          updates.push(`amount = $${paramCount}`);
          values.push(parseFloat(amount));
          paramCount++;
        }

        if (updates.length === 0) {
          return res.status(400).json({ 
            success: false,
            error: 'NO_UPDATES',
            message: '❌ ไม่มีข้อมูลที่ต้องการอัปเดต กรุณาระบุ name หรือ amount' 
          });
        }

        const now = Date.now().toString();
        updates.push(`updated_at = $${paramCount}`);
        values.push(now);
        paramCount++;

        values.push(accountId);
        values.push(userId);

        const updateQuery = `
          UPDATE accounts 
          SET ${updates.join(', ')}
          WHERE id = $${paramCount - 1} AND user_id = $${paramCount} AND deleted_at IS NULL
          RETURNING *
        `;

        const updateResult = await client.query(updateQuery, values);
        
        if (updateResult.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'UPDATE_FAILED',
            message: '❌ ไม่สามารถอัปเดตบัญชีได้ บัญชีอาจถูกลบหรือไม่มีสิทธิ์เข้าถึง' 
          });
        }
        
        const updatedAccount = updateResult.rows[0];

        return res.json({
          success: true,
          message: '✅ อัปเดตบัญชีสำเร็จ',
          data: {
            ...updatedAccount,
            balance: updatedAccount.amount,
            created_at: updatedAccount.created_at ? updatedAccount.created_at.toString() : null,
            updated_at: updatedAccount.updated_at ? updatedAccount.updated_at.toString() : null
          },
          changes: {
            name: name !== undefined ? { old: existingAccount.name, new: name.trim() } : undefined,
            amount: amount !== undefined ? { old: existingAccount.amount.toString(), new: amount.toString() } : undefined
          }
        });
      }

      // DELETE - ลบบัญชี (soft delete)
      if (req.method === 'DELETE') {
        // ตรวจสอบว่าบัญชีมีอยู่และเป็นของผู้ใช้
        const existingResult = await client.query(
          'SELECT * FROM accounts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
          [accountId, userId]
        );

        if (existingResult.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'ACCOUNT_NOT_FOUND',
            message: '❌ ไม่พบบัญชีที่ต้องการลบ' 
          });
        }

        // ตรวจสอบว่ามีธุรกรรมที่เกี่ยวข้อง
        const transactionResult = await client.query(
          'SELECT COUNT(*) FROM transactions WHERE (account_id = $1 OR related_account_id = $1) AND deleted_at IS NULL',
          [accountId]
        );

        const transactionCount = parseInt(transactionResult.rows[0].count);

        if (transactionCount > 0) {
          return res.status(400).json({ 
            success: false,
            error: 'HAS_TRANSACTIONS',
            message: `⚠️ ไม่สามารถลบบัญชีได้ เนื่องจากมีธุรกรรม ${transactionCount} รายการที่เกี่ยวข้อง`,
            transactionCount: transactionCount
          });
        }

        // Soft delete
        const now = Date.now().toString();
        await client.query(
          'UPDATE accounts SET deleted_at = $1, updated_at = $2 WHERE id = $3',
          [now, now, accountId]
        );

        return res.json({
          success: true,
          message: '✅ ลบบัญชีสำเร็จ',
          deletedAccount: {
            id: accountId,
            name: existingResult.rows[0].name
          }
        });
      }

      return res.status(405).json({ 
        success: false,
        error: 'METHOD_NOT_ALLOWED',
        message: `❌ Method ${req.method} ไม่ได้รับอนุญาต กรุณาใช้ GET, PATCH หรือ DELETE`,
        allowedMethods: ['GET', 'PATCH', 'DELETE']
      });
    } catch (error) {
      console.error('Account [id] API error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'INTERNAL_SERVER_ERROR', 
        message: '❌ เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      await client.end();
    }
  })(req, res);
};

module.exports = handler;
