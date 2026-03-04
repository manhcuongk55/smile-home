import { NextResponse } from 'next/server';
import { NotificationService } from '@/services/notification.service';

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the current role
 */
export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role') || 'USER';

        if (role === 'ADMIN') {
            await NotificationService.markAllAsReadByRole('ADMIN');
        } else {
            // MVP Mode: Always use 'mock-user-1'
            await NotificationService.markAllAsReadByUser('mock-user-1');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
