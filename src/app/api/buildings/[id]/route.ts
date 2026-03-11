import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const building = await prisma.building.update({
        where: { id },
        data: {
            ...(body.name && { name: body.name }),
            ...(body.floors && { floors: body.floors }),
        },
    });
    return NextResponse.json(building);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.building.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
