const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function upsertUser(prisma, { name, email, role, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash, isVerified: true },
    create: { name, email, role, passwordHash, isVerified: true },
  });
}

async function main() {
  const prisma = new PrismaClient();

  const creds = [
    { name: 'Admin', email: 'admin@aro.local', role: 'ADMIN', password: 'Admin12345!' },
    { name: 'John Doe (Owner)', email: 'john@owner.com', role: 'LANDOWNER', password: 'Owner12345!' },
    { name: 'Alice Smith (Farmer)', email: 'alice@farmer.com', role: 'FARMER', password: 'Farmer12345!' },
    { name: 'Bob Capital (Investor)', email: 'bob@invest.com', role: 'INVESTOR', password: 'Investor12345!' },
  ];

  for (const c of creds) {
    await upsertUser(prisma, c);
  }

  console.log('CREATED_OR_UPDATED_USERS');
  for (const c of creds) {
    console.log(`${c.role}\t${c.email}\t${c.password}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

