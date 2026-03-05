import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const count = await prisma.contract.count({
            where: {
                status: 'PENDING'
            }
        });
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Failed to get pending count:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
