// /api/auth/register.js - Vercel Serverless Function
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
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST method is allowed for registration'
    });
  }

  try {
    console.log('Register request received:', req.body);
    
    const { 
      firstname, 
      lastname, 
      displayname, 
      phone, 
      email, 
      password 
    } = req.body;

    // Validation
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
      // ตรวจสอบว่ามี email นี้อยู่ในระบบแล้วหรือไม่
      const existingUserQuery = `
        SELECT id FROM users 
        WHERE email = $1 AND deleted_at IS NULL
        LIMIT 1
      `;
      const existingUserResult = await client.query(existingUserQuery, [email.toLowerCase()]);

      if (existingUserResult.rows.length > 0) {
        return res.status(400).json({
          error: 'Registration failed',
          message: 'Email address is already registered.',
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const currentTime = Date.now();
      const insertUserQuery = `
        INSERT INTO users (firstname, lastname, displayname, phone, email, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, firstname, lastname, displayname, phone, email, created_at
      `;
      
      const newUserResult = await client.query(insertUserQuery, [
        firstname?.trim() || null,
        lastname?.trim() || null,
        displayname?.trim() || null,
        phone?.trim() || null,
        email.toLowerCase().trim(),
        hashedPassword,
        currentTime,
        currentTime
      ]);

      const newUser = newUserResult.rows[0];
    } finally {
      // Always close the connection
      await client.end();
    }

      // Generate JWT token
      const tokenPayload = {
        id: newUser.id,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        displayname: newUser.displayname,
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

      // Return success response
      const response = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            displayname: newUser.displayname,
            phone: newUser.phone,
            created_at: newUser.created_at?.toString(),
          },
          token,
        },
      };

      console.log('Registration successful for:', email);
      return res.status(201).json(response);

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during registration',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}