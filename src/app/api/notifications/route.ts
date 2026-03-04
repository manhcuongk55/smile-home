import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';

/**
 * GET /api/notifications
 * Lists notifications based on current user's role/ID with pagination
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role') || 'USER';
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        let notifications = [];
        if (role === 'ADMIN') {
            notifications = await NotificationService.getNotificationsForRole('ADMIN', limit, offset);
        } else {
            // MVP Mode: Always return notifications for 'mock-user-1'
            notifications = await NotificationService.getNotificationsForUser('mock-user-1', limit, offset);
        }

        return NextResponse.json({ notifications, limit, offset });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
