const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const contracts = await prisma.contract.findMany({
        where: {
            OR: [
                { contractCode: null },
                { contractCode: 'TEMP_CODE' }
            ]
        }
    });

    console.log(`Found ${contracts.length} contracts to update.`);

    for (const c of contracts) {
        const shortId = c.id.substring(0, 8).toUpperCase();
        const code = `SH-FIX-${shortId}`;
        await prisma.contract.update({
            where: { id: c.id },
            data: { contractCode: code }
        });
        console.log(`Updated ${c.id.substring(0,8)} -> ${code}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
