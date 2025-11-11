const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile, 
  changePassword 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Middleware สำหรับตรวจสอบ validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data.',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

/**
 * POST /api/auth/register
 * สมัครสมาชิกใหม่
 */
router.post('/register', [
  // Validation rules
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('firstname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('First name must be between 1 and 255 characters'),
  
  body('lastname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Last name must be between 1 and 255 characters'),
  
  body('displayname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Display name must be between 1 and 255 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Phone number must be valid (10-15 digits)'),
], handleValidationErrors, register);

/**
 * POST /api/auth/login
 * เข้าสู่ระบบ
 */
router.post('/login', [
  // Validation rules
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], handleValidationErrors, login);

/**
 * POST /api/auth/logout
 * ออกจากระบบ
 */
router.post('/logout', logout);

/**
 * GET /api/auth/profile
 * ดูข้อมูล profile ของตัวเอง (ต้องมี token)
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * PUT /api/auth/profile
 * อัปเดตข้อมูล profile (ต้องมี token)
 */
router.put('/profile', [
  authenticateToken,
  // Validation rules
  body('firstname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('First name must be between 1 and 255 characters'),
  
  body('lastname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Last name must be between 1 and 255 characters'),
  
  body('displayname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Display name must be between 1 and 255 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Phone number must be valid (10-15 digits)'),
], handleValidationErrors, updateProfile);

/**
 * POST /api/auth/change-password
 * เปลี่ยนรหัสผ่าน (ต้องมี token)
 */
router.post('/change-password', [
  authenticateToken,
  // Validation rules
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
], handleValidationErrors, changePassword);

/**
 * GET /api/auth/me
 * Alias for /profile (บางครั้งใช้ /me สะดวกกว่า)
 */
router.get('/me', authenticateToken, getProfile);

/**
 * POST /api/auth/verify-token
 * ตรวจสอบว่า token ยังใช้ได้หรือไม่
 */
router.post('/verify-token', authenticateToken, (req, res) => {
  // ถ้าผ่าน authenticateToken middleware ได้แสดงว่า token ถูกต้อง
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user,
      tokenData: req.tokenData,
    },
  });
});

module.exports = router;