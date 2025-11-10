const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding (idempotent)...');

  // Ensure the global types exist (if migration didn't insert them)
  const existing = await prisma.types.findMany();
  if (existing.length === 0) {
    await prisma.$executeRaw`INSERT INTO "types" (name) VALUES ('Income'), ('Expense'), ('Transfer')`;
    console.log('✅ Seeded types table');
  } else {
    console.log('ℹ️ types table already has data');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });