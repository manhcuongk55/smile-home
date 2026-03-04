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
        take: 10
    });
    console.log(JSON.stringify(contracts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
