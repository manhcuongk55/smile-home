import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eventEmitter, CONTRACT_EVENT } from '@/lib/events';

export const runtime = 'nodejs';

async function getPendingCount() {
    return await prisma.contract.count({
        where: {
            documents: {
                some: {
                    documentType: 'CONTRACT',
                    approvalStatus: 'PENDING'
                }
            }
        }
    });
}

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial count
            const initialCount = await getPendingCount();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ count: initialCount })}\n\n`));

            // Define the listener
            const listener = async () => {
                const count = await getPendingCount();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ count })}\n\n`));
            };

            // Subscribe to events
            eventEmitter.on(CONTRACT_EVENT, listener);

            // Handle connection close
            req.signal.addEventListener('abort', () => {
                eventEmitter.off(CONTRACT_EVENT, listener);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
