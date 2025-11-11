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

  const transactionId = req.query.id;

  if (!transactionId) {
    return res.status(400).json({ 
      success: false,
      error: 'MISSING_TRANSACTION_ID',
      message: '❌ กรุณาระบุ ID ของธุรกรรม' 
    });
  }

  return authenticate(async (req, res) => {
    const userId = req.user.id;
    const client = req.client;

    try {
      // GET - ดึงธุรกรรมเดียว
      if (req.method === 'GET') {
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
           WHERE t.id = $1 AND t.user_id = $2 AND t.deleted_at IS NULL`,
          [transactionId, userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'TRANSACTION_NOT_FOUND',
            message: '❌ ไม่พบธุรกรรมที่ต้องการ' 
          });
        }

        const transaction = result.rows[0];

        return res.json({ 
          success: true, 
          data: {
            ...transaction,
            date: transaction.date ? transaction.date.toString() : null,
            created_at: transaction.created_at ? transaction.created_at.toString() : null,
            updated_at: transaction.updated_at ? transaction.updated_at.toString() : null,
            account: { id: transaction.account_id, name: transaction.account_name, amount: transaction.account_balance },
            category: { id: transaction.category_id, name: transaction.category_name, type: { name: transaction.type_name } },
            type: { id: transaction.type_id, name: transaction.type_name },
            related_account: transaction.related_account_id ? { id: transaction.related_account_id, name: transaction.related_account_name } : null
          }
        });
      }

      // PATCH - แก้ไขธุรกรรม
      if (req.method === 'PATCH') {
        const { amount, description, date, transaction_date, account_id, category_id, related_account_id } = req.body;
        const transactionDate = date || transaction_date;

        await client.query('BEGIN');

        try {
          // ตรวจสอบธุรกรรมเดิม
          const existingResult = await client.query(
            `SELECT t.*, c.type_id, ty.name as type_name
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             JOIN types ty ON c.type_id = ty.id
             WHERE t.id = $1 AND t.user_id = $2 AND t.deleted_at IS NULL`,
            [transactionId, userId]
          );

          if (existingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
              success: false,
              error: 'TRANSACTION_NOT_FOUND',
              message: '❌ ไม่พบธุรกรรมที่ต้องการแก้ไข' 
            });
          }

          const existingTransaction = existingResult.rows[0];
          const oldAmount = parseFloat(existingTransaction.amount);
          const oldTypeName = existingTransaction.type_name;

          // ค่าที่จะใช้ในการอัปเดต (ถ้าไม่มีการเปลี่ยนแปลงใช้ค่าเดิม)
          let newAmount = amount !== undefined ? Math.abs(parseFloat(amount)) : oldAmount;
          let newAccountId = account_id || existingTransaction.account_id;
          let newCategoryId = category_id || existingTransaction.category_id;
          let newRelatedAccountId = related_account_id !== undefined ? related_account_id : existingTransaction.related_account_id;
          let newTypeName = oldTypeName;

          // Validation
          if (amount !== undefined && amount <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              success: false,
              error: 'VALIDATION_ERROR',
              message: '❌ กรุณาระบุจำนวนเงินที่ถูกต้อง',
              field: 'amount'
            });
          }

          // ตรวจสอบ account ใหม่ (ถ้ามี)
          if (account_id && account_id !== existingTransaction.account_id) {
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
          }

          // ตรวจสอบ category ใหม่ (ถ้ามี)
          if (category_id && category_id !== existingTransaction.category_id) {
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

            newTypeName = categoryResult.rows[0].type_name;
          }

          // ตรวจสอบ related_account สำหรับ Transfer
          if (newTypeName === 'Transfer') {
            if (!newRelatedAccountId) {
              await client.query('ROLLBACK');
              return res.status(400).json({ 
                success: false,
                error: 'VALIDATION_ERROR', 
                message: '❌ กรุณาเลือกบัญชีปลายทางสำหรับการโอนเงิน',
                field: 'related_account_id' 
              });
            }

            if (newRelatedAccountId === newAccountId) {
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
              [newRelatedAccountId, userId]
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

          // ยกเลิกการเปลี่ยนแปลงยอดเงินเดิม
          // คืนยอดเงินให้บัญชีเดิม
          let oldBalanceChange = oldAmount;
          if (oldTypeName === 'Expense' || oldTypeName === 'Transfer') {
            oldBalanceChange = -oldBalanceChange;
          }
          // กลับคืนยอดเงิน (ทำตรงกันข้าม)
          await client.query(
            'UPDATE accounts SET amount = amount - $1, updated_at = $2 WHERE id = $3',
            [oldBalanceChange, Date.now().toString(), existingTransaction.account_id]
          );

          // ถ้าเดิมเป็น Transfer ต้องคืนเงินจากบัญชีปลายทางเดิมด้วย
          if (oldTypeName === 'Transfer' && existingTransaction.related_account_id) {
            await client.query(
              'UPDATE accounts SET amount = amount - $1, updated_at = $2 WHERE id = $3',
              [oldAmount, Date.now().toString(), existingTransaction.related_account_id]
            );
          }

          // ตรวจสอบยอดเงินคงเหลือสำหรับ Expense และ Transfer
          if (newTypeName === 'Transfer' || newTypeName === 'Expense') {
            const accountResult = await client.query(
              'SELECT name, amount FROM accounts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
              [newAccountId, userId]
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

            const currentBalance = parseFloat(accountResult.rows[0].amount);
            
            if (currentBalance < newAmount) {
              await client.query('ROLLBACK');
              return res.status(400).json({
                success: false,
                error: 'INSUFFICIENT_BALANCE',
                message: `⚠️ ยอดเงินในบัญชี "${accountResult.rows[0].name}" ไม่เพียงพอ (คงเหลือ: ${currentBalance.toLocaleString()} บาท, ต้องการ: ${newAmount.toLocaleString()} บาท)`,
                field: 'amount',
                currentBalance: currentBalance,
                requiredAmount: newAmount
              });
            }
          }

          // อัปเดตธุรกรรม
          const updates = [];
          const values = [];
          let paramCount = 1;

          if (amount !== undefined) {
            updates.push(`amount = $${paramCount}`);
            values.push(newAmount);
            paramCount++;
          }

          if (description !== undefined) {
            updates.push(`description = $${paramCount}`);
            values.push(description || null);
            paramCount++;
          }

          if (transactionDate !== undefined) {
            const txDate = transactionDate ? new Date(transactionDate).getTime().toString() : Date.now().toString();
            updates.push(`date = $${paramCount}`);
            values.push(txDate);
            paramCount++;
          }

          if (account_id !== undefined) {
            updates.push(`account_id = $${paramCount}`);
            values.push(account_id);
            paramCount++;
          }

          if (category_id !== undefined) {
            // ต้องอัปเดต type_id ด้วย
            const categoryResult = await client.query(
              'SELECT type_id FROM categories WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
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
            
            updates.push(`category_id = $${paramCount}`);
            values.push(category_id);
            paramCount++;

            updates.push(`type_id = $${paramCount}`);
            values.push(categoryResult.rows[0].type_id);
            paramCount++;
          }

          if (related_account_id !== undefined) {
            updates.push(`related_account_id = $${paramCount}`);
            values.push(related_account_id || null);
            paramCount++;
          }

          if (updates.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              success: false,
              error: 'NO_UPDATES',
              message: '❌ ไม่มีข้อมูลที่ต้องการอัปเดต กรุณาระบุข้อมูลใหม่'
            });
          }

          const now = Date.now().toString();
          updates.push(`updated_at = $${paramCount}`);
          values.push(now);
          paramCount++;

          const transactionIdParam = paramCount;
          values.push(transactionId);
          paramCount++;

          const userIdParam = paramCount;
          values.push(userId);
          paramCount++;

          const updateQuery = `
            UPDATE transactions 
            SET ${updates.join(', ')}
            WHERE id = $${transactionIdParam} AND user_id = $${userIdParam} AND deleted_at IS NULL
            RETURNING *
          `;

          const updateResult = await client.query(updateQuery, values);

          if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
              success: false,
              error: 'UPDATE_FAILED',
              message: '❌ ไม่สามารถอัปเดตธุรกรรมได้ ธุรกรรมอาจถูกลบหรือไม่มีสิทธิ์เข้าถึง'
            });
          }

          // คำนวณยอดเงินใหม่
          let newBalanceChange = newAmount;
          if (newTypeName === 'Expense' || newTypeName === 'Transfer') {
            newBalanceChange = -newBalanceChange;
          }

          // อัปเดตยอดเงินบัญชีใหม่
          await client.query(
            'UPDATE accounts SET amount = amount + $1, updated_at = $2 WHERE id = $3',
            [newBalanceChange, now, newAccountId]
          );

          // ถ้าเป็น Transfer ต้องอัปเดตบัญชีปลายทางด้วย
          if (newTypeName === 'Transfer' && newRelatedAccountId) {
            await client.query(
              'UPDATE accounts SET amount = amount + $1, updated_at = $2 WHERE id = $3',
              [newAmount, now, newRelatedAccountId]
            );
          }

          await client.query('COMMIT');

          const updatedTransaction = updateResult.rows[0];

          // ดึงข้อมูลเพิ่มเติมหลังอัปเดตเพื่อให้ response ครบถ้วน
          const enrichedResult = await client.query(
            `SELECT 
              t.*,
              a.name AS account_name,
              a.amount AS account_balance,
              ra.name AS related_account_name,
              c.name AS category_name,
              ty.name AS type_name
             FROM transactions t
             JOIN accounts a ON t.account_id = a.id
             LEFT JOIN accounts ra ON t.related_account_id = ra.id
             JOIN categories c ON t.category_id = c.id
             JOIN types ty ON t.type_id = ty.id
             WHERE t.id = $1`,
            [updatedTransaction.id]
          );

          const enrichedTransaction = enrichedResult.rows[0] || updatedTransaction;

          return res.json({
            success: true,
            message: '✅ อัปเดตธุรกรรมสำเร็จ',
            data: {
              ...enrichedTransaction,
              date: enrichedTransaction.date ? enrichedTransaction.date.toString() : null,
              created_at: enrichedTransaction.created_at ? enrichedTransaction.created_at.toString() : null,
              updated_at: enrichedTransaction.updated_at ? enrichedTransaction.updated_at.toString() : null,
              account: enrichedTransaction.account_id ? {
                id: enrichedTransaction.account_id,
                name: enrichedTransaction.account_name,
                amount: enrichedTransaction.account_balance
              } : null,
              category: enrichedTransaction.category_id ? {
                id: enrichedTransaction.category_id,
                name: enrichedTransaction.category_name
              } : null,
              type: enrichedTransaction.type_id ? {
                id: enrichedTransaction.type_id,
                name: enrichedTransaction.type_name
              } : null,
              related_account: enrichedTransaction.related_account_id ? {
                id: enrichedTransaction.related_account_id,
                name: enrichedTransaction.related_account_name
              } : null
            }
          });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      }

      // DELETE - ลบธุรกรรม (soft delete)
      if (req.method === 'DELETE') {
        await client.query('BEGIN');

        try {
          // ตรวจสอบธุรกรรม
          const existingResult = await client.query(
            `SELECT t.*, c.type_id, ty.name as type_name
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             JOIN types ty ON c.type_id = ty.id
             WHERE t.id = $1 AND t.user_id = $2 AND t.deleted_at IS NULL`,
            [transactionId, userId]
          );

          if (existingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
              success: false,
              error: 'TRANSACTION_NOT_FOUND',
              message: '❌ ไม่พบธุรกรรมที่ต้องการลบ' 
            });
          }

          const transaction = existingResult.rows[0];
          const amount = parseFloat(transaction.amount);
          const typeName = transaction.type_name;

          // คืนยอดเงินให้บัญชี
          let balanceChange = amount;
          if (typeName === 'Expense' || typeName === 'Transfer') {
            balanceChange = -balanceChange;
          }
          // กลับคืนยอดเงิน (ทำตรงกันข้าม)
          await client.query(
            'UPDATE accounts SET amount = amount - $1, updated_at = $2 WHERE id = $3',
            [balanceChange, Date.now().toString(), transaction.account_id]
          );

          // ถ้าเป็น Transfer ต้องคืนเงินจากบัญชีปลายทางด้วย
          if (typeName === 'Transfer' && transaction.related_account_id) {
            await client.query(
              'UPDATE accounts SET amount = amount - $1, updated_at = $2 WHERE id = $3',
              [amount, Date.now().toString(), transaction.related_account_id]
            );
          }

          // Soft delete
          const now = Date.now().toString();
          await client.query(
            'UPDATE transactions SET deleted_at = $1, updated_at = $2 WHERE id = $3',
            [now, now, transactionId]
          );

          await client.query('COMMIT');

          return res.json({
            success: true,
            message: '✅ ลบธุรกรรมสำเร็จ',
            deletedTransaction: {
              id: transactionId,
              amount: amount,
              description: transaction.description
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
        message: `❌ Method ${req.method} ไม่ได้รับอนุญาต กรุณาใช้ GET, PATCH หรือ DELETE`,
        allowedMethods: ['GET', 'PATCH', 'DELETE']
      });
    } catch (error) {
      console.error('Transaction [id] API error:', error);
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
