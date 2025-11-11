const { PrismaClient } = require('@prisma/client');

// สร้าง Prisma Client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Handle disconnection gracefully
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;