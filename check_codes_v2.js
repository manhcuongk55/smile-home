const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const contracts = await prisma.contract.findMany({
        select: {
            id: true,
            contractCode: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    contracts.forEach(c => {
        console.log(`ID: ${c.id.substring(0,8)}, Code: ${c.contractCode}, Date: ${c.createdAt}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
