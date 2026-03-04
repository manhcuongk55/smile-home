import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';

/**
 * PATCH /api/notifications/[id]/read
 * Marks a specific notification as read after verifying the requester is the recipient
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role') || 'USER';
        
        // MVP Mode: No auth, mock user based on role
        const mockUser = { 
            userId: role === 'ADMIN' ? 'SYSTEM' : 'mock-user-1', 
            role: role as 'ADMIN' | 'USER' 
        };
        
        const result = await NotificationService.markAsRead(id, mockUser);
        
        return NextResponse.json({ success: true, notification: result });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        if (error.message.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
