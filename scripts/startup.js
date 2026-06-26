const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const PRISMA_CLI = path.join(ROOT, 'node_modules', 'prisma', 'build', 'index.js');

async function main() {
  // Remove any .env files that might override Dokploy env vars
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
  for (const f of envFiles) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) {
      console.log(`[startup] Removing stale ${f} file`);
      fs.unlinkSync(p);
    }
  }

  const dbUrl = process.env.DATABASE_URL || '';
  console.log('[startup] DATABASE_URL starts with:', dbUrl.substring(0, 25) + '...');

  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('[startup] ERROR: DATABASE_URL is not a PostgreSQL URL!');
    console.error('[startup] Got:', dbUrl.substring(0, 40));
    // List all env files found
    const allFiles = fs.readdirSync(ROOT).filter(f => f.startsWith('.env'));
    console.error('[startup] .env files in /app:', allFiles.length ? allFiles : 'none');
    process.exit(1);
  }

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
