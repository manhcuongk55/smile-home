import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const person = await prisma.person.update({
        where: { id },
        data: {
            ...(body.leadStatus && { leadStatus: body.leadStatus }),
            ...(body.name && { name: body.name }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.phone !== undefined && { phone: body.phone }),
            ...(body.notes !== undefined && { notes: body.notes }),
        },
    });
    return NextResponse.json(person);
}
