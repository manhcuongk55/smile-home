const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const contracts = await prisma.contract.findMany({
        select: {
            id: true,
            status: true,
            documents: {
                select: {
                    documentType: true,
                    approvalStatus: true
                }
            }
        }
    });
    console.log(JSON.stringify(contracts, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
