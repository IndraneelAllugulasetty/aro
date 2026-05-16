const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  const email = process.env.ADMIN_EMAIL || 'admin@aro.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin12345!';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: 'Admin', role: 'ADMIN', passwordHash, isVerified: true },
    create: { name: 'Admin', email, role: 'ADMIN', passwordHash, isVerified: true },
  });

  // Print creds for local dev usage.
  console.log('ADMIN_CREATED', { email, password, id: user.id });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

