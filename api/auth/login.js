// /api/auth/login.js - Vercel Serverless Function
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Setup CORS
const setCORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Use native PostgreSQL client instead of Prisma for better serverless compatibility
const { Client } = require('pg');

// Create database connection
const createDbConnection = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
};

export default async function handler(req, res) {
  setCORS(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST method is allowed for login'
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email and password are required'
      });
    }

    // Connect to database
    const client = createDbConnection();
    await client.connect();

    try {
      // Find user
      const userQuery = `
        SELECT id, firstname, lastname, displayname, phone, email, password
        FROM users 
        WHERE email = $1 AND deleted_at IS NULL
        LIMIT 1
      `;
      const userResult = await client.query(userQuery, [email.toLowerCase()]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password',
        });
      }

      const user = userResult.rows[0];

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password',
        });
      }
    } finally {
      // Always close the connection
      await client.end();
    }

      // Generate token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        displayname: user.displayname,
      };

      const token = jwt.sign(
        tokenPayload, 
        process.env.JWT_SECRET || 'fallback-secret-key',
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
          issuer: 'money-manage-api',
          audience: 'money-manage-app',
        }  
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            displayname: user.displayname,
            phone: user.phone,
          },
          token,
        },
      });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
}