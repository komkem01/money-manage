const { Pool } = require('pg');

const createPool = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: process.env.PG_POOL_MAX ? Number(process.env.PG_POOL_MAX) : 10,
    idleTimeoutMillis: process.env.PG_IDLE_TIMEOUT ? Number(process.env.PG_IDLE_TIMEOUT) : 30000,
    connectionTimeoutMillis: process.env.PG_CONNECTION_TIMEOUT ? Number(process.env.PG_CONNECTION_TIMEOUT) : 5000,
  });

  pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error', error);
  });

  return pool;
};

const getPool = () => {
  if (!global._pgPool) {
    global._pgPool = createPool();
  }
  return global._pgPool;
};

const getClient = async () => {
  const pool = getPool();
  const client = await pool.connect();
  return client;
};

const query = (text, params) => {
  const pool = getPool();
  return pool.query(text, params);
};

module.exports = {
  getPool,
  getClient,
  query,
};
