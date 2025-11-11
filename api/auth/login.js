// /api/auth/login.js - Vercel Serverless Function
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Setup CORS
const setCORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Import Prisma with global instance for serverless
const { PrismaClient } = require('@prisma/client');

// Global Prisma instance to prevent multiple connections in serverless
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['error', 'warn']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

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

    // Find user
    const user = await prisma.users.findFirst({
      where: { 
        email: email.toLowerCase(),
        deleted_at: null,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
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