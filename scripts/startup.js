const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const PRISMA_CLI = path.join(ROOT, 'node_modules', 'prisma', 'build', 'index.js');
const SCHEMA = path.join(ROOT, 'prisma', 'schema.prisma');

async function main() {
  // Remove any .env files that might override Dokploy env vars
  for (const f of ['.env', '.env.local', '.env.production', '.env.development']) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) {
      console.log(`[startup] Removing stale ${f}`);
      fs.unlinkSync(p);
    }
  }

  // Verify schema file
  const schema = fs.readFileSync(SCHEMA, 'utf8');
  console.log('[startup] Schema provider:', schema.match(/provider\s*=\s*"(\w+)"/g));

  const dbUrl = process.env.DATABASE_URL || '';
  console.log('[startup] DATABASE_URL starts with:', dbUrl.substring(0, 25) + '...');

  // Regenerate Prisma Client with correct DATABASE_URL
  console.log('[startup] Regenerating Prisma Client...');
  execSync(`node ${PRISMA_CLI} generate --schema=${SCHEMA}`, {
    stdio: 'inherit',
    cwd: ROOT,
    env: { ...process.env }
  });

  console.log('[startup] Pushing database schema...');
  execSync(`node ${PRISMA_CLI} db push --skip-generate --schema=${SCHEMA}`, {
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
