import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler for a specific contract with Next.js 16 async params support
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
            room: { include: { building: true } },
            person: true,
        }
    });
    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    return NextResponse.json(contract);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const contract = await prisma.contract.update({
            where: { id },
            data: {
                status: body.status,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                monthlyRent: body.monthlyRent,
                deposit: body.deposit,
            },
        });
        return NextResponse.json(contract);
    } catch (error) {
        console.error('Failed to update contract:', error);
        return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }
}
