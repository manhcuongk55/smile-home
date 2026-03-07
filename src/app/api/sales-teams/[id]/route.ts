import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const team = await prisma.salesTeam.findUnique({
        where: { id },
        include: {
            contracts: {
                include: {
                    room: { include: { building: true } },
                    person: true,
                },
                orderBy: { createdAt: 'desc' },
            },
            commissions: {
                orderBy: { month: 'desc' },
            },
        },
    });
    if (!team) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(team);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const team = await prisma.salesTeam.update({
            where: { id },
            data: {
                ...(body.name !== undefined && { name: body.name }),
                ...(body.leader !== undefined && { leader: body.leader }),
                ...(body.phone !== undefined && { phone: body.phone }),
                ...(body.commissionRate !== undefined && { commissionRate: body.commissionRate }),
                ...(body.bonusTarget !== undefined && { bonusTarget: body.bonusTarget }),
                ...(body.bonusRate !== undefined && { bonusRate: body.bonusRate }),
                ...(body.status !== undefined && { status: body.status }),
            },
        });
        return NextResponse.json(team);
    } catch (error) {
        console.error('Failed to update sales team:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // Soft delete — set to INACTIVE
        const team = await prisma.salesTeam.update({
            where: { id },
            data: { status: 'INACTIVE' },
        });
        return NextResponse.json(team);
    } catch (error) {
        console.error('Failed to deactivate sales team:', error);
        return NextResponse.json({ error: 'Failed to deactivate' }, { status: 500 });
    }
}
