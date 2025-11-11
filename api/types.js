const { Client } = require('pg');

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
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    
    const result = await client.query('SELECT * FROM types ORDER BY name ASC');

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Types API error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  } finally {
    await client.end();
  }
};

module.exports = handler;
