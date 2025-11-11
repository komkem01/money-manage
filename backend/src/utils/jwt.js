const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * สร้าง JWT Token
 * @param {Object} payload - ข้อมูลที่ต้องการเก็บใน token
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @returns {string} JWT Token
 */
const generateToken = (payload) => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      iat: Math.floor(Date.now() / 1000), // issued at
    },
    secretKey,
    { expiresIn }
  );
};

/**
 * ตรวจสอบและ decode JWT Token
 * @param {string} token - JWT Token
 * @returns {Promise<Object>} Decoded token payload
 * @throws {Error} ถ้า token ไม่ถูกต้อง
 */
const verifyToken = async (token) => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    // ตรวจสอบ token
    const decoded = jwt.verify(token, secretKey);
    
    // ตรวจสอบว่า user ยังมีอยู่ในระบบและไม่ถูกลบ
    const user = await prisma.users.findFirst({
      where: {
        id: decoded.userId,
        deleted_at: null, // ไม่ถูก soft delete
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        displayname: true,
        phone: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new Error('User not found or has been deleted');
    }

    return {
      ...decoded,
      user, // เพิ่มข้อมูล user เข้าไปใน decoded token
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else {
      throw error;
    }
  }
};

/**
 * ดึง User ID จาก token
 * @param {string} token - JWT Token
 * @returns {Promise<string>} User ID
 */
const getUserIdFromToken = async (token) => {
  const decoded = await verifyToken(token);
  return decoded.userId;
};

/**
 * ดึงข้อมูล User จาก token
 * @param {string} token - JWT Token
 * @returns {Promise<Object>} User object
 */
const getUserFromToken = async (token) => {
  const decoded = await verifyToken(token);
  return decoded.user;
};

/**
 * ตรวจสอบว่า token หมดอายุแล้วหรือไม่
 * @param {string} token - JWT Token
 * @returns {boolean} true ถ้าหมดอายุ
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  getUserIdFromToken,
  getUserFromToken,
  isTokenExpired,
};