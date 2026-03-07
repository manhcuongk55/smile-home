import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const teams = await prisma.salesTeam.findMany({
        include: {
            _count: { select: { contracts: true, commissions: true } },
            commissions: {
                select: { totalPayout: true, status: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const result = teams.map((team) => ({
        ...team,
        totalContracts: team._count.contracts,
        totalCommissions: team._count.commissions,
        totalPaid: team.commissions
            .filter((c) => c.status === 'PAID')
            .reduce((sum, c) => sum + c.totalPayout, 0),
        totalPending: team.commissions
            .filter((c) => c.status === 'PENDING' || c.status === 'APPROVED')
            .reduce((sum, c) => sum + c.totalPayout, 0),
        commissions: undefined,
        _count: undefined,
    }));

    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const team = await prisma.salesTeam.create({
            data: {
                code: body.code,
                name: body.name,
                leader: body.leader || null,
                phone: body.phone || null,
                commissionRate: body.commissionRate || 5,
                bonusTarget: body.bonusTarget || 0,
                bonusRate: body.bonusRate || 0,
                status: body.status || 'ACTIVE',
            },
        });

        // Auto-log
        await prisma.activityLog.create({
            data: {
                entityType: 'SalesTeam',
                entityId: team.id,
                action: 'CREATE',
                performedBy: 'ADMIN',
                newValue: JSON.stringify({ code: team.code, name: team.name, commissionRate: team.commissionRate }),
                note: `Sales team ${team.code} created`,
            },
        });

        return NextResponse.json(team, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (message.includes('Unique constraint')) {
            return NextResponse.json({ error: 'Mã đội sale đã tồn tại' }, { status: 409 });
        }
        console.error('Failed to create sales team:', error);
        return NextResponse.json({ error: 'Failed to create sales team' }, { status: 500 });
    }
}
