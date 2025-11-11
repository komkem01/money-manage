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

  const categoryId = req.query.id;

  if (!categoryId) {
    return res.status(400).json({ 
      success: false,
      error: 'MISSING_CATEGORY_ID',
      message: '❌ กรุณาระบุ ID ของหมวดหมู่' 
    });
  }

  return authenticate(async (req, res) => {
    const userId = req.user.id;
    const client = req.client;

    try {
      // GET - ดึงหมวดหมู่เดียว
      if (req.method === 'GET') {
        const result = await client.query(
          `SELECT c.*, t.name as type_name
           FROM categories c
           JOIN types t ON c.type_id = t.id
           WHERE c.id = $1 AND c.user_id = $2 AND c.deleted_at IS NULL`,
          [categoryId, userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'CATEGORY_NOT_FOUND',
            message: '❌ ไม่พบหมวดหมู่ที่ต้องการ' 
          });
        }

        const category = result.rows[0];

        return res.json({ 
          success: true, 
          data: {
            ...category,
            created_at: category.created_at ? category.created_at.toString() : null,
            updated_at: category.updated_at ? category.updated_at.toString() : null,
            type: {
              id: category.type_id,
              name: category.type_name
            }
          }
        });
      }

      // PATCH - แก้ไขหมวดหมู่
      if (req.method === 'PATCH') {
        const { name, type_id } = req.body;

        // ตรวจสอบว่าหมวดหมู่มีอยู่และเป็นของผู้ใช้
        const existingResult = await client.query(
          'SELECT * FROM categories WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
          [categoryId, userId]
        );

        if (existingResult.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'CATEGORY_NOT_FOUND',
            message: '❌ ไม่พบหมวดหมู่ที่ต้องการแก้ไข' 
          });
        }

        const existingCategory = existingResult.rows[0];

        // Validation
        if (name !== undefined && (!name || !name.trim())) {
          return res.status(400).json({ 
            success: false,
            error: 'VALIDATION_ERROR',
            message: '❌ ชื่อหมวดหมู่ไม่สามารถเป็นค่าว่างได้',
            field: 'name' 
          });
        }

        // ตรวจสอบ type_id ถ้ามีการเปลี่ยน
        let newTypeName = null;
        if (type_id !== undefined) {
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

          newTypeName = typeResult.rows[0].name;
        }

        // ตรวจสอบชื่อซ้ำ (ในประเภทเดียวกัน)
        if (name !== undefined) {
          const checkTypeId = type_id || existingCategory.type_id;
          const duplicateResult = await client.query(
            'SELECT id, name FROM categories WHERE user_id = $1 AND type_id = $2 AND LOWER(name) = LOWER($3) AND id != $4 AND deleted_at IS NULL',
            [userId, checkTypeId, name.trim(), categoryId]
          );

          if (duplicateResult.rows.length > 0) {
            // ดึงชื่อประเภท
            const typeNameResult = await client.query('SELECT name FROM types WHERE id = $1', [checkTypeId]);
            const typeName = typeNameResult.rows[0].name;

            return res.status(409).json({ 
              success: false,
              error: 'DUPLICATE_NAME',
              message: `⚠️ มีหมวดหมู่ "${name.trim()}" ในประเภท "${typeName}" อยู่แล้ว กรุณาใช้ชื่ออื่น`,
              field: 'name',
              existingCategory: {
                id: duplicateResult.rows[0].id,
                name: duplicateResult.rows[0].name,
                type: typeName
              }
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

        if (type_id !== undefined) {
          updates.push(`type_id = $${paramCount}`);
          values.push(type_id);
          paramCount++;
        }

        if (updates.length === 0) {
          return res.status(400).json({ 
            success: false,
            error: 'NO_UPDATES',
            message: '❌ ไม่มีข้อมูลที่ต้องการอัปเดต กรุณาระบุ name หรือ type_id' 
          });
        }

        const now = Date.now().toString();
        updates.push(`updated_at = $${paramCount}`);
        values.push(now);
        paramCount++;

        values.push(categoryId);
        values.push(userId);

        const updateQuery = `
          UPDATE categories 
          SET ${updates.join(', ')}
          WHERE id = $${paramCount - 1} AND user_id = $${paramCount} AND deleted_at IS NULL
          RETURNING *
        `;

        const updateResult = await client.query(updateQuery, values);
        const updatedCategory = updateResult.rows[0];

        // ดึงชื่อประเภทใหม่
        const typeResult = await client.query('SELECT name FROM types WHERE id = $1', [updatedCategory.type_id]);

        return res.json({
          success: true,
          message: '✅ อัปเดตหมวดหมู่สำเร็จ',
          data: {
            ...updatedCategory,
            created_at: updatedCategory.created_at ? updatedCategory.created_at.toString() : null,
            updated_at: updatedCategory.updated_at ? updatedCategory.updated_at.toString() : null,
            type: {
              id: updatedCategory.type_id,
              name: typeResult.rows[0].name
            }
          },
          changes: {
            name: name !== undefined ? { old: existingCategory.name, new: name.trim() } : undefined,
            type_id: type_id !== undefined ? { old: existingCategory.type_id, new: type_id } : undefined
          }
        });
      }

      // DELETE - ลบหมวดหมู่ (soft delete)
      if (req.method === 'DELETE') {
        // ตรวจสอบว่าหมวดหมู่มีอยู่และเป็นของผู้ใช้
        const existingResult = await client.query(
          'SELECT * FROM categories WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
          [categoryId, userId]
        );

        if (existingResult.rows.length === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'CATEGORY_NOT_FOUND',
            message: '❌ ไม่พบหมวดหมู่ที่ต้องการลบ' 
          });
        }

        // ตรวจสอบว่ามีธุรกรรมที่ใช้หมวดหมู่นี้
        const transactionResult = await client.query(
          'SELECT COUNT(*) FROM transactions WHERE category_id = $1 AND deleted_at IS NULL',
          [categoryId]
        );

        const transactionCount = parseInt(transactionResult.rows[0].count);

        if (transactionCount > 0) {
          return res.status(400).json({ 
            success: false,
            error: 'HAS_TRANSACTIONS',
            message: `⚠️ ไม่สามารถลบหมวดหมู่ได้ เนื่องจากมีธุรกรรม ${transactionCount} รายการที่ใช้หมวดหมู่นี้`,
            transactionCount: transactionCount
          });
        }

        // Soft delete
        const now = Date.now().toString();
        await client.query(
          'UPDATE categories SET deleted_at = $1, updated_at = $2 WHERE id = $3',
          [now, now, categoryId]
        );

        return res.json({
          success: true,
          message: '✅ ลบหมวดหมู่สำเร็จ',
          deletedCategory: {
            id: categoryId,
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
      console.error('Category [id] API error:', error);
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
