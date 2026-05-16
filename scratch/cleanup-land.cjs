const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  const deleted = await prisma.land.deleteMany({
    where: {
      sizeAcres: {
        lte: 0
      }
    }
  });
  console.log(`DELETED_${deleted.count}_LANDS_WITH_INVALID_ACREAGE`);
  await prisma.$disconnect();
}

cleanup();
