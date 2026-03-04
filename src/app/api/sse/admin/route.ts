import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { SSEManager } from '@/lib/sse';

export const runtime = 'nodejs';

/**
 * GET /api/sse/admin
 * Establishes a persistent SSE connection for Admin users only.
 */
export async function GET(req: Request) {
    try {
        // MVP Mode: No auth check
        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
            start(controller) {
                // Register connection
                SSEManager.addAdmin(controller);

                // Send initial keep-alive and buffer-bursting comment
                // 2KB of spaces avoids buffering in proxy/Turbopack
                controller.enqueue(encoder.encode(':connected\n\n'));
                controller.enqueue(encoder.encode(':' + ' '.repeat(2048) + '\n\n'));

                // Set up heartbeat every 15s to keep connection alive
                const heartbeat = setInterval(() => {
                    try {
                        controller.enqueue(encoder.encode(':keep-alive\n\n'));
                    } catch (err) {
                        clearInterval(heartbeat);
                    }
                }, 15000);

                // Log connect
                console.log(`[SSE-Admin] Connection established (MVP Mode)`);

                 // Handle cleanup when connection is closed
                const cleanup = () => {
                    clearInterval(heartbeat);
                    SSEManager.removeAdmin(controller);
                    console.log(`[SSE-Admin] Connection closed cleanup`);
                    try { controller.close(); } catch (e) {}
                };

                req.signal.onabort = cleanup;
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform, no-store, must-revalidate',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
                'Pragma': 'no-cache',
                'Content-Encoding': 'identity',
            }
        });

    } catch (error) {
        console.error('[SSE-Admin] Connection error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
