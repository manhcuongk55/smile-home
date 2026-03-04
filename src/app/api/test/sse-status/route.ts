import { NextResponse } from 'next/server';
import { SSEManager } from '@/lib/sse';

export async function GET() {
    // This is a bit hacky as we reach into private state but we need to know
    // @ts-ignore
    const adminCount = (globalThis as any).adminConnections?.size || 0;
    // @ts-ignore
    const userCount = (globalThis as any).userConnections?.size || 0;
    
    return NextResponse.json({
        adminConnections: adminCount,
        userConnections: userCount,
        timestamp: new Date().toISOString()
    });
}
