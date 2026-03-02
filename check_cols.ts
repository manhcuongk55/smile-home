
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result: any[] = await prisma.$queryRaw`PRAGMA table_info(Contract)`;
  console.log('Columns in Contract table:', JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main();
