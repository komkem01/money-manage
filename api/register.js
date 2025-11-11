const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ใช้ Client แทน Pool สำหรับ Serverless
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
    
    const { firstname, lastname, displayname, phone, email, password } = req.body;

    // ตรวจสอบ email ซ้ำ
    const existingUserResult = await client.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Email address is already registered.',
      });
    }

    // เข้ารหัสรหัสผ่าน
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const now = Date.now().toString();

    // สร้าง user ใหม่
    const newUserResult = await client.query(
      `INSERT INTO users (firstname, lastname, displayname, phone, email, password, created_at, updated_at)
       VALUES ($1, $2, $3, $4, LOWER($5), $6, $7, $8)
       RETURNING id, firstname, lastname, displayname, phone, email, created_at`,
      [firstname || null, lastname || null, displayname || null, phone || null, email, hashedPassword, now, now]
    );

    const newUser = newUserResult.rows[0];

    // สร้าง JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          ...newUser,
          created_at: newUser.created_at ? newUser.created_at.toString() : null,
        },
        token,
        tokenType: 'Bearer',
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration. Please try again.',
    });
  } finally {
    await client.end();
  }
};

module.exports = handler;
