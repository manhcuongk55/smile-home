import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const salesTeamId = searchParams.get('salesTeamId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (month) {
        const startOfMonth = new Date(month);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        where.month = { gte: startOfMonth, lt: endOfMonth };
    }
    if (salesTeamId) where.salesTeamId = salesTeamId;
    if (status) where.status = status;

    const commissions = await prisma.commission.findMany({
        where,
        include: {
            salesTeam: true,
            contract: {
                include: {
                    room: { include: { building: true } },
                    person: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(commissions);
}

// POST: Calculate commissions for a given month
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const monthStr = body.month; // "2026-03" format

        if (!monthStr) {
            return NextResponse.json({ error: 'Missing month parameter' }, { status: 400 });
        }

        const monthDate = new Date(monthStr + '-01');
        monthDate.setHours(0, 0, 0, 0);

        // Find all ACTIVE contracts with a salesTeamId
        const contracts = await prisma.contract.findMany({
            where: {
                status: 'ACTIVE',
                salesTeamId: { not: null },
                startDate: { lte: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0) },
                endDate: { gte: monthDate },
            },
            include: {
                salesTeam: true,
            },
        });

        // Check existing commissions for this month to avoid duplicates
        const existing = await prisma.commission.findMany({
            where: {
                month: monthDate,
            },
            select: { contractId: true },
        });
        const existingContractIds = new Set(existing.map((e: { contractId: string }) => e.contractId));

        // Calculate commissions per sales team for bonus evaluation
        const teamTotals: Record<string, { total: number; team: typeof contracts[0]['salesTeam'] }> = {};
        const newContracts = contracts.filter((c) => !existingContractIds.has(c.id));

        for (const contract of newContracts) {
            if (!contract.salesTeam) continue;
            const teamId = contract.salesTeam.id;
            if (!teamTotals[teamId]) {
                teamTotals[teamId] = { total: 0, team: contract.salesTeam };
            }
            teamTotals[teamId].total += contract.monthlyRent;
        }

        const created = [];
        for (const contract of newContracts) {
            if (!contract.salesTeam) continue;

            const rate = contract.salesTeam.commissionRate;
            const amount = (contract.monthlyRent * rate) / 100;

            // Calculate bonus if team exceeds target
            let bonusAmount = 0;
            const teamData = teamTotals[contract.salesTeam.id];
            if (
                teamData &&
                contract.salesTeam.bonusTarget > 0 &&
                teamData.total >= contract.salesTeam.bonusTarget
            ) {
                bonusAmount = (contract.monthlyRent * contract.salesTeam.bonusRate) / 100;
            }

            const totalPayout = amount + bonusAmount;

            const commission = await prisma.commission.create({
                data: {
                    salesTeamId: contract.salesTeam.id,
                    contractId: contract.id,
                    month: monthDate,
                    contractValue: contract.monthlyRent,
                    rate,
                    amount,
                    bonusAmount,
                    totalPayout,
                    status: 'PENDING',
                },
            });
            created.push(commission);
        }

        return NextResponse.json({
            message: `Calculated ${created.length} commission records for ${monthStr}`,
            count: created.length,
            skipped: existingContractIds.size,
            records: created,
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to calculate commissions:', error);
        return NextResponse.json({ error: 'Failed to calculate commissions' }, { status: 500 });
    }
}
