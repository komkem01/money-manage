const { PrismaClient } = require('@prisma/client');

// สร้าง Prisma client แบบ singleton
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  // ในโหมด development ใช้ global variable เพื่อป้องกัน hot reload สร้าง instance ใหม่
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;