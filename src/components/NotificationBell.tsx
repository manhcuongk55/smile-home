'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';

// --- TYPES ---
interface NotificationItemData {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    referenceId?: string;
    createdAt: string;
}

const PAGE_SIZE = 10;

// --- MAIN COMPONENT ---
export default function NotificationBell() {
    const { unreadCount, refreshUnreadCount } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const userRole = pathname.startsWith('/admin') ? 'ADMIN' : 'USER';

    // 1. Fetch data logic
    const fetchNotifications = useCallback(async (isInitial: boolean = false) => {
        if (loading || (!hasMore && !isInitial)) return;
        
        setLoading(true);
        const currentOffset = isInitial ? 0 : page * PAGE_SIZE;

        try {
            const res = await fetch(`/api/notifications?limit=${PAGE_SIZE}&offset=${currentOffset}&role=${userRole}`);
            if (res.ok) {
                const data = await res.json();
                const newItems = data.notifications || [];
                
                if (isInitial) {
                    setNotifications(newItems);
                    setPage(1);
                } else {
                    setNotifications(prev => [...prev, ...newItems]);
                    setPage(prev => prev + 1);
                }
                
                if (newItems.length < PAGE_SIZE) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [userRole, page, loading, hasMore]);

    // 2. Initial fetch when opening
    useEffect(() => {
        if (isOpen) {
            fetchNotifications(true);
        } else {
            // Reset pagination state when closing if needed, but keeping it simple for now
            // setPage(0);
            // setHasMore(true);
        }
    }, [isOpen]);

    // 3. Infinite Scroll: Observed element ref
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchNotifications();
            }
        }, { threshold: 0.1 });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchNotifications]);

    // 4. Mark as Read logic
    const handleMarkAsRead = async (id: string, referenceId?: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}/read?role=${userRole}`, {
                method: 'PATCH',
            });
            
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                refreshUnreadCount();
                if (referenceId) {
                    const path = userRole === 'ADMIN' 
                        ? `/admin/contracts?contractId=${referenceId}` 
                        : `/contracts?contractId=${referenceId}`;
                    router.push(path);
                    setIsOpen(false);
                }
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = await fetch(`/api/notifications/read-all?role=${userRole}`, {
                method: 'PATCH',
            });
            
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                refreshUnreadCount();
            }
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format badge count
    const badgeText = unreadCount > 99 ? '99+' : unreadCount;

    return (
        <div className="notification-bell-container" style={{ position: 'relative', zIndex: 9999 }} ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`bell-trigger ${isOpen ? 'active' : ''}`}
                style={{
                    background: isOpen ? 'var(--bg-card-hover)' : 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    color: 'var(--text-primary)',
                    transition: 'var(--transition-fast)',
                    outline: 'none'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>🔔</span>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        background: 'var(--accent-rose)',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        padding: unreadCount > 9 ? '2px 4px' : '2px 6px',
                        borderRadius: '10px',
                        border: '2px solid var(--bg-card)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        minWidth: '18px',
                        textAlign: 'center'
                    }}>
                        {badgeText}
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown 
                    notifications={notifications}
                    loading={loading}
                    onMarkRead={handleMarkAsRead}
                    onMarkAllRead={handleMarkAllAsRead}
                    lastElementRef={lastElementRef}
                    hasMore={hasMore}
                    unreadCount={unreadCount}
                />
            )}

            <style jsx>{`
                .bell-trigger:hover {
                    background: var(--bg-card-hover);
                    border-color: var(--accent-blue);
                }
            `}</style>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function NotificationDropdown({ notifications, loading, onMarkRead, onMarkAllRead, lastElementRef, hasMore, unreadCount }: any) {
    return (
        <div className="notification-dropdown" style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            width: '350px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-subtle)',
            zIndex: 10000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'dropdownFadeIn 0.2s ease-out'
        }}>
            <div className="dropdown-header" style={{ 
                padding: '14px 16px', 
                borderBottom: '1px solid var(--border-subtle)', 
                fontWeight: '700', 
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem',
                background: 'var(--bg-card)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Thông báo</span>
                    {notifications.length > 0 && <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Mới nhất</span>}
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={onMarkAllRead}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-blue)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        className="mark-all-btn"
                    >
                        <span>✓✓</span> Đọc hết
                    </button>
                )}
            </div>
            
            <style jsx>{`
                .mark-all-btn:hover {
                    background: var(--accent-blue-glow);
                    text-decoration: underline;
                }
            `}</style>
            
            <div className="notification-list" style={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                background: 'var(--bg-card)',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--border-subtle) transparent'
            }}>
                {notifications.length === 0 && !loading ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }}>📭</div>
                        Chưa có thông báo nào
                    </div>
                ) : (
                    <>
                        {notifications.map((item: NotificationItemData, index: number) => (
                            <NotificationItem 
                                key={item.id} 
                                item={item} 
                                onClick={() => onMarkRead(item.id, item.referenceId)}
                                // Attach ref to the last item for observer
                                ref={index === notifications.length - 1 ? lastElementRef : null}
                            />
                        ))}
                        
                        {loading && (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                <div className="spinner" style={{ 
                                    width: '18px', 
                                    height: '18px', 
                                    border: '2px solid var(--border-subtle)', 
                                    borderTopColor: 'var(--accent-blue)', 
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    animation: 'spin 0.8s linear infinite',
                                    marginRight: '8px',
                                    verticalAlign: 'middle'
                                }}></div>
                                Đang tải thêm...
                            </div>
                        )}
                        
                        {!hasMore && notifications.length > 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', opacity: 0.7 }}>
                                — Đã hiển thị tất cả thông báo —
                            </div>
                        )}
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .notification-list::-webkit-scrollbar {
                    width: 6px;
                }
                .notification-list::-webkit-scrollbar-thumb {
                    background: var(--border-subtle);
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
}

const NotificationItem = React.forwardRef<HTMLDivElement, { item: NotificationItemData, onClick: () => void }>(({ item, onClick }, ref) => {
    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Vừa xong';
        if (mins < 60) return `${mins} phút trước`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return `${Math.floor(hours / 24)} ngày trước`;
    }

    const { isRead } = item;

    return (
        <div 
            ref={ref}
            onClick={onClick}
            className={`notification-item ${isRead ? 'read' : 'unread'}`}
            style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                background: isRead ? 'transparent' : 'var(--accent-blue-glow)',
                transition: 'var(--transition-fast)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
            }}
        >
            <div style={{ 
                fontWeight: isRead ? '600' : '700', 
                fontSize: '0.85rem', 
                color: isRead ? 'var(--text-secondary)' : 'var(--text-primary)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start' 
            }}>
                <span style={{ flex: 1, paddingRight: '12px', lineHeight: '1.2' }}>{item.title}</span>
                {!isRead && (
                    <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        background: 'var(--accent-blue)', 
                        borderRadius: '50%', 
                        flexShrink: 0,
                        marginTop: '4px',
                        boxShadow: '0 0 8px var(--accent-blue)'
                    }}></span>
                )}
            </div>
            
            <div style={{ 
                fontSize: '0.8rem', 
                color: isRead ? 'var(--text-muted)' : 'var(--text-secondary)', 
                marginTop: '4px',
                lineHeight: '1.4',
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden' 
            }}>
                {item.message}
            </div>
            
            <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-muted)', 
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                <span>🕒</span>
                {timeAgo(item.createdAt)}
            </div>

            <style jsx>{`
                .notification-item:hover {
                    background: var(--bg-card-hover) !important;
                }
                .notification-item.unread:hover {
                    background: var(--accent-blue-glow) !important;
                    filter: brightness(0.95);
                }
                :global(.dark) .notification-item.unread:hover {
                    filter: brightness(1.1);
                }
            `}</style>
        </div>
    );
});

NotificationItem.displayName = 'NotificationItem';
