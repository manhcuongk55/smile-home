import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const commission = await prisma.commission.update({
            where: { id },
            data: {
                ...(body.status !== undefined && { status: body.status }),
                ...(body.note !== undefined && { note: body.note }),
                ...(body.bonusAmount !== undefined && {
                    bonusAmount: body.bonusAmount,
                    totalPayout: body.bonusAmount + (await prisma.commission.findUnique({ where: { id }, select: { amount: true } }))!.amount,
                }),
            },
        });
        return NextResponse.json(commission);
    } catch (error) {
        console.error('Failed to update commission:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
