const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

/**
 * สมัครสมาชิกใหม่
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { 
      firstname, 
      lastname, 
      displayname, 
      phone, 
      email, 
      password 
    } = req.body;

    // ตรวจสอบว่ามี email นี้อยู่ในระบบแล้วหรือไม่
    const existingUser = await prisma.users.findFirst({
      where: { 
        email: email.toLowerCase(),
        deleted_at: null, // ไม่นับ user ที่ถูก soft delete
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Email address is already registered.',
      });
    }

    // เข้ารหัสรหัสผ่าน
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // สร้าง timestamp
    const now = BigInt(Date.now());

    // สร้าง user ใหม่
    const newUser = await prisma.users.create({
      data: {
        firstname: firstname || null,
        lastname: lastname || null,
        displayname: displayname || null,
        phone: phone || null,
        email: email.toLowerCase(),
        password: hashedPassword,
        created_at: now,
        updated_at: now,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        displayname: true,
        phone: true,
        email: true,
        created_at: true,
      },
    });

    // สร้าง JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // ส่งข้อมูลกลับ (แปลง BigInt)
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
  }
};

/**
 * เข้าสู่ระบบ
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ค้นหา user จาก email
    const user = await prisma.users.findFirst({
      where: { 
        email: email.toLowerCase(),
        deleted_at: null, // ไม่นับ user ที่ถูก soft delete
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Login failed',
        message: 'Invalid email or password.',
      });
    }

    // ตรวจสอบรหัสผ่าน
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Login failed',
        message: 'Invalid email or password.',
      });
    }

    // อัปเดต updated_at
    const now = BigInt(Date.now());
    await prisma.users.update({
      where: { id: user.id },
      data: { updated_at: now },
    });

    // สร้าง JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // ส่งข้อมูลกลับ (ไม่รวม password และแปลง BigInt)
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
  }
};

/**
 * ออกจากระบบ
 * POST /api/auth/logout
 * หมายเหตุ: ในระบบ JWT stateless นี้ logout จะเป็นการ advisory เท่านั้น
 * Client ต้องลบ token ออกจาก storage เอง
 */
const logout = async (req, res) => {
  try {
    // ในระบบ JWT stateless การ logout คือการบอกให้ client ลบ token
    // หากต้องการ blacklist token จริงๆ จะต้องมี token blacklist database
    
    res.json({
      success: true,
      message: 'Logout successful. Please remove the token from your client.',
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout.',
    });
  }
};

/**
 * ดูข้อมูล Profile ของตัวเอง
 * GET /api/auth/profile
 * ต้องมี authentication middleware
 */
const getProfile = async (req, res) => {
  try {
    // ข้อมูล user มาจาก authentication middleware (แปลง BigInt)
    const { created_at, updated_at, deleted_at, ...userWithoutBigInt } = req.user;

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          ...userWithoutBigInt,
          created_at: created_at ? created_at.toString() : null,
          updated_at: updated_at ? updated_at.toString() : null,
        },
      },
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'An error occurred while retrieving profile.',
    });
  }
};

/**
 * อัปเดตข้อมูล Profile
 * PUT /api/auth/profile
 * ต้องมี authentication middleware
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstname, lastname, displayname, phone } = req.body;

    // อัปเดตข้อมูล user
    const now = BigInt(Date.now());
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        firstname: firstname || null,
        lastname: lastname || null,
        displayname: displayname || null,
        phone: phone || null,
        updated_at: now,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        displayname: true,
        phone: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          ...updatedUser,
          created_at: updatedUser.created_at ? updatedUser.created_at.toString() : null,
          updated_at: updatedUser.updated_at ? updatedUser.updated_at.toString() : null,
        },
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile.',
    });
  }
};

/**
 * เปลี่ยนรหัสผ่าน
 * POST /api/auth/change-password
 * ต้องมี authentication middleware
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    // ดึงข้อมูล user เพื่อตรวจสอบรหัสผ่านเก่า
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found.',
      });
    }

    // ตรวจสอบรหัสผ่านเก่า
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidCurrentPassword) {
      return res.status(400).json({
        error: 'Invalid current password',
        message: 'Current password is incorrect.',
      });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // อัปเดตรหัสผ่าน
    const now = BigInt(Date.now());
    await prisma.users.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updated_at: now,
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: 'An error occurred while changing password.',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
};