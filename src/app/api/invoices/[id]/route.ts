import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            contract: {
                include: {
                    person: true,
                    room: true
                }
            },
            receipts: true,
            interactions: {
                include: { person: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    return NextResponse.json(invoice);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                status: body.status,
                amount: body.amount,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            },
        });

        // Log activity if verified
        if (body.status === 'VERIFIED') {
            await prisma.activityLog.create({
                data: {
                    entityType: 'Invoice',
                    entityId: id,
                    action: 'APPROVE',
                    performedBy: 'ACCOUNTANT',
                    newValue: JSON.stringify({ status: 'VERIFIED' }),
                    note: 'Invoice payment verified by accounting'
                }
            });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Failed to update invoice:', error);
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }
}
