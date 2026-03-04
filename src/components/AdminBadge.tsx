'use client';

import { useNotification } from '@/context/NotificationContext';

interface AdminBadgeProps {
    href: string;
}

export default function AdminBadge({ href }: AdminBadgeProps) {
    const { pendingTasks } = useNotification();

    // Only show badge for the Contract Review link in this context
    if (href !== '/admin/contracts') return null;
    const count = pendingTasks;

    if (count <= 0) return null;

    return (
        <span style={{
            marginLeft: 'auto',
            background: 'var(--accent-rose, #ef4444)',
            color: 'white',
            fontSize: '0.625rem',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '10px',
            minWidth: '18px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
            {count > 99 ? '99+' : count}
            
            <style jsx>{`
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </span>
    );
}
