const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tableInfo = await prisma.$queryRaw`PRAGMA table_info(Contract)`;
    console.log(JSON.stringify(tableInfo, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
