// scripts/startup.js — runs before server.js
// Creates DB tables via Prisma and seeds if empty

const { execSync } = require('child_process');
const path = require('path');

async function main() {
  // Push schema to DB using prisma binary directly
  const prismaBin = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma');

  console.log('[startup] Pushing database schema...');
  try {
    execSync(`node ${path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js')} db push --skip-generate`, {
      stdio: 'inherit',
      env: { ...process.env }
    });
  } catch {
    // If the above fails, try with the schema path explicitly
    execSync(`node ${path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js')} db push --skip-generate --schema=./prisma/schema.prisma`, {
      stdio: 'inherit',
      env: { ...process.env }
    });
  }

  // Check if DB is empty and seed
  const { PrismaClient } = require('@prisma/client');
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
