import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { SSEManager } from '@/lib/sse';

export const runtime = 'nodejs';

/**
 * GET /api/sse/user
 * Establishes a persistent SSE connection for a specific USER.
 */
export async function GET(req: Request) {
    try {
        // MVP Mode: Hardcoded mock user ID
        const userId = 'mock-user-1';

        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
            start(controller) {
                // Register connection
                SSEManager.addUser(userId, controller);

                // Send initial keep-alive and buffer-bursting comment
                controller.enqueue(encoder.encode(':connected\n\n'));
                controller.enqueue(encoder.encode(':' + ' '.repeat(2048) + '\n\n'));

                // Set up heartbeat every 15s
                const heartbeat = setInterval(() => {
                    try {
                        controller.enqueue(encoder.encode(':keep-alive\n\n'));
                    } catch (err) {
                        clearInterval(heartbeat);
                    }
                }, 15000);

                // Log connect
                console.log(`[SSE-User] Connection established for ${userId} (MVP Mode)`);

                // Handle cleanup
                const cleanup = () => {
                    clearInterval(heartbeat);
                    SSEManager.removeUser(userId, controller);
                    console.log(`[SSE-User] Connection closed for ${userId}`);
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
            }
        });

    } catch (error) {
        console.error('[SSE-User] Connection error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
