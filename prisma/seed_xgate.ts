import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Xgate test data...');

    // 1. Create Owner (Top Level)
    const owner = await prisma.person.create({
        data: {
            name: 'Nguyen Van X',
            role: 'OWNER',
            email: 'owner@xgate.com',
            phone: '0901234567',
            tenantId: 'default'
        }
    });

    // 2. Create Manager under Owner
    const manager = await prisma.person.create({
        data: {
            name: 'Manager Minh',
            role: 'STAFF',
            email: 'minh.manager@xgate.com',
            parentId: owner.id,
            tenantId: 'default'
        }
    });

    // 3. Create Agent under Manager
    const agent = await prisma.person.create({
        data: {
            name: 'Agent An',
            role: 'STAFF',
            email: 'an.agent@xgate.com',
            parentId: manager.id,
            tenantId: 'default'
        }
    });

    // 4. Create Leads for Agent
    await prisma.person.createMany({
        data: [
            {
                name: 'Lead Facebook 1',
                role: 'LEAD',
                leadStatus: 'NEW',
                source: 'Facebook',
                value: 5000000,
                parentId: agent.id,
                tenantId: 'default',
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Stale lead (5 days ago)
            },
            {
                name: 'Lead Referral 2',
                role: 'LEAD',
                leadStatus: 'CONTACTED',
                source: 'Referral',
                value: 12000000,
                parentId: agent.id,
                tenantId: 'default'
            },
            {
                name: 'Lead Website 3',
                role: 'LEAD',
                leadStatus: 'PROPOSAL',
                source: 'Website',
                value: 8500000,
                parentId: agent.id,
                tenantId: 'default'
            }
        ]
    });

    console.log('Xgate seed data successfully populated!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
