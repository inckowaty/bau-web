// scripts/startup.js — runs before server.js
// Creates DB tables and seeds if empty

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function main() {
  // Push schema to DB (creates tables if missing)
  console.log('[startup] Pushing database schema...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });

  // Check if DB is empty
  const prisma = new PrismaClient();
  const adminCount = await prisma.admin.count();

  if (adminCount === 0) {
    console.log('[startup] Database is empty, running seed...');
    await prisma.$disconnect();
    execSync('node prisma/seed.js', { stdio: 'inherit' });
  } else {
    console.log('[startup] Database already has data, skipping seed.');
    await prisma.$disconnect();
  }

  // Start the Next.js server
  console.log('[startup] Starting server...');
  require('./server.js');
}

main().catch((e) => {
  console.error('[startup] Failed:', e);
  process.exit(1);
});
