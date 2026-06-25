const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRISMA_CLI = path.join(ROOT, 'node_modules', 'prisma', 'build', 'index.js');

async function main() {
  console.log('[startup] Pushing database schema...');
  execSync(`node ${PRISMA_CLI} db push --skip-generate --schema=${path.join(ROOT, 'prisma', 'schema.prisma')}`, {
    stdio: 'inherit',
    cwd: ROOT,
    env: { ...process.env }
  });

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const adminCount = await prisma.admin.count();

  if (adminCount === 0) {
    console.log('[startup] Database is empty, running seed...');
    await prisma.$disconnect();
    execSync(`node ${path.join(ROOT, 'prisma', 'seed.js')}`, { stdio: 'inherit', cwd: ROOT });
  } else {
    console.log('[startup] Database already has data, skipping seed.');
    await prisma.$disconnect();
  }

  console.log('[startup] Starting server...');
  require(path.join(ROOT, 'server.js'));
}

main().catch((e) => {
  console.error('[startup] Failed:', e);
  process.exit(1);
});
