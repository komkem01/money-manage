const { Pool } = require('pg');

// สร้าง connection pool สำหรับ PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * ฟังก์ชันสำหรับ query ฐานข้อมูล
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 Query executed:', { text, duration: `${duration}ms`, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

/**
 * ฟังก์ชันสำหรับ transaction
 */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * ฟังก์ชันช่วยสำหรับ parameterized query
 */
const buildInsertQuery = (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.join(', ');
  
  const text = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  return { text, values };
};

const buildUpdateQuery = (table, data, whereClause) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  
  const text = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
  return { text, values };
};

module.exports = {
  pool,
  query,
  transaction,
  buildInsertQuery,
  buildUpdateQuery,
};