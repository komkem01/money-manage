const { verifyToken } = require('../utils/jwt');

/**
 * Middleware สำหรับตรวจสอบ JWT Token
 * ใช้กับ routes ที่ต้องการ authentication
 */
const authenticateToken = async (req, res, next) => {
  try {
    // ดึง token จาก Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) // ตัด "Bearer " ออก
      : null;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided. Please include Authorization header with Bearer token.',
      });
    }

    // ตรวจสอบและ decode token
    const decoded = await verifyToken(token);
    
    // เพิ่มข้อมูล user และ token info เข้าไปใน request object
    req.user = {
      id: decoded.userId, // สำคัญ: ใส่ id ที่ controller คาดหวัง
      ...decoded.user,
    };
    req.userId = decoded.userId;
    req.tokenData = {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    // กำหนด status code ตาม error type
    let statusCode = 401;
    let message = 'Invalid or expired token';
    
    if (error.message === 'Token has expired') {
      statusCode = 401;
      message = 'Token has expired. Please login again.';
    } else if (error.message === 'Invalid token') {
      statusCode = 401;
      message = 'Invalid token format.';
    } else if (error.message === 'User not found or has been deleted') {
      statusCode = 401;
      message = 'User account not found or has been deactivated.';
    }

    return res.status(statusCode).json({
      error: 'Authentication failed',
      message,
    });
  }
};

/**
 * Middleware สำหรับตรวจสอบ token (Optional)
 * ใช้กับ routes ที่ token เป็น optional
 * ถ้ามี token จะเพิ่มข้อมูล user เข้าไป ถ้าไม่มี token ก็ผ่าน
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : null;

    if (token) {
      try {
        const decoded = await verifyToken(token);
        req.user = decoded.user;
        req.userId = decoded.userId;
        req.tokenData = {
          userId: decoded.userId,
          email: decoded.email,
          iat: decoded.iat,
          exp: decoded.exp,
        };
      } catch (error) {
        // ถ้า token ไม่ถูกต้อง ให้ผ่านไปแบบไม่มี user data
        console.warn('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    // ถ้ามี error อื่นๆ ให้ผ่านไปโดยไม่ต้องหยุด
    console.error('Optional authentication error:', error);
    next();
  }
};

/**
 * Middleware สำหรับตรวจสอบสิทธิ์ Admin (ในอนาคต)
 * ใช้ร่วมกับ authenticateToken
 */
const requireAdmin = async (req, res, next) => {
  // ต้องผ่าน authenticateToken ก่อน
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login first.',
    });
  }

  // ตรวจสอบสิทธิ์ admin (ในอนาคตอาจจะเพิ่ม role field ในตาราง users)
  // ตอนนี้ให้ทุกคนเป็นแอดมินไปก่อน
  if (req.user.email === 'admin@example.com') {
    next();
  } else {
    return res.status(403).json({
      error: 'Access forbidden',
      message: 'Admin privileges required.',
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
};