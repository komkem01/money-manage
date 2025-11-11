const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

const handler = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = getClient();
  
  try {
    await client.connect();
    
    const { email, password } = req.body;

    // ค้นหา user
    const userResult = await client.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Login failed',
        message: 'Invalid email or password.',
      });
    }

    const user = userResult.rows[0];

    // ตรวจสอบรหัสผ่าน
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Login failed',
        message: 'Invalid email or password.',
      });
    }

    // อัปเดต updated_at
    const now = Date.now().toString();
    await client.query('UPDATE users SET updated_at = $1 WHERE id = $2', [now, user.id]);

    // สร้าง JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // ส่งข้อมูลกลับ
    const { password: _, created_at, updated_at, deleted_at, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...userWithoutPassword,
          created_at: created_at ? created_at.toString() : null,
          updated_at: updated_at ? updated_at.toString() : null,
        },
        token,
        tokenType: 'Bearer',
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login. Please try again.',
    });
  } finally {
    await client.end();
  }
};

module.exports = handler;
