const { Client } = require('pg');

const getClient = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
};

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '❌ Method ไม่ได้รับอนุญาต กรุณาใช้ GET',
      allowedMethods: ['GET']
    });
  }

  const client = await getClient();

  try {
    const result = await client.query('SELECT * FROM types ORDER BY name ASC');

    const types = result.rows.map(type => ({
      ...type,
      created_at: type.created_at ? type.created_at.toString() : null,
      updated_at: type.updated_at ? type.updated_at.toString() : null,
    }));

    return res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Types API error:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '❌ เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

module.exports = handler;
