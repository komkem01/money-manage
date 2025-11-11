// /api/auth/register.js - Vercel Serverless Function
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Setup CORS
const setCORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Import Prisma (ใช้ dynamic import เพื่อป้องกัน error)
let prisma;
const getPrisma = async () => {
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return prisma;
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

    const db = await getPrisma();

    // ตรวจสอบว่ามี email นี้อยู่ในระบบแล้วหรือไม่
    const existingUser = await db.users.findFirst({
      where: { 
        email: email.toLowerCase(),
        deleted_at: null,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Email address is already registered.',
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const currentTime = BigInt(Date.now());
    const newUser = await db.users.create({
      data: {
        firstname: firstname?.trim() || null,
        lastname: lastname?.trim() || null,
        displayname: displayname?.trim() || null,
        phone: phone?.trim() || null,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        created_at: currentTime,
        updated_at: currentTime,
      },
    });

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