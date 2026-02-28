import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Billing & Communication test data...');

    // Get an existing contract or create one
    const contract = await prisma.contract.findFirst({
        include: { person: true }
    });

    if (!contract) {
        console.error('No contract found to seed invoices. Please seed base data first.');
        return;
    }

    // Create some invoices
    const invoices = await prisma.invoice.createMany({
        data: [
            {
                contractId: contract.id,
                invoiceNumber: `INV-JAN-${Date.now()}`,
                amount: 8500,
                status: 'PAID',
                dueDate: new Date('2026-01-30')
            },
            {
                contractId: contract.id,
                invoiceNumber: `INV-FEB-${Date.now()}`,
                amount: 8500,
                status: 'PENDING',
                dueDate: new Date('2026-02-28')
            },
            {
                contractId: contract.id,
                invoiceNumber: `INV-MAR-${Date.now()}`,
                amount: 8500,
                status: 'DRAFT',
                dueDate: new Date('2026-03-31')
            }
        ]
    });

    console.log('Billing & Communication data successfully populated!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
