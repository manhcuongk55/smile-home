import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';

/**
 * GET /api/notifications/unread-count
 * Returns unread count based on current user's role and ID from JWT
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role') || 'USER';

        let count = 0;
        let pendingTasks = 0;

        if (role === 'ADMIN') {
            [count, pendingTasks] = await Promise.all([
                NotificationService.getUnreadCountByRole('ADMIN'),
                NotificationService.getPendingTasksCount()
            ]);
        } else {
            // MVP Mode: Always use 'mock-user-1' for USER role
            count = await NotificationService.getUnreadCountByUser('mock-user-1');
        }

        return NextResponse.json({ count, pendingTasks });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
