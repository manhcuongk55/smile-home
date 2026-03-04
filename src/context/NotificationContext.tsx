'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { mutate } from 'swr';

interface Toast {
  id: string;
  type: 'contract_uploaded' | 'contract_approved' | 'contract_rejected';
  title: string;
  message: string;
  contractId?: string;
}

interface NotificationContextType {
  unreadCount: number;
  pendingTasks: number;
  toasts: Toast[];
  removeToast: (id: string) => void;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathname = usePathname();
  
  // MVP Mode: Determine role by route
  const userRole = pathname.startsWith('/admin') ? 'ADMIN' : 'USER';

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications/unread-count?role=${userRole}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[NotificationContext] counts updated (${userRole}): Unread=${data.count}, Pending=${data.pendingTasks}`);
        setUnreadCount(data.count);
        setPendingTasks(data.pendingTasks || 0);
      }
    } catch (err) {
      console.error('[NotificationContext] Failed to fetch unread count:', err);
    }
  }, [userRole]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    console.log(`[NotificationContext] Adding toast: ${toast.title}`);
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    // Auto remove after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    // Initial fetch for the current role
    refreshUnreadCount();

    // Setup SSE based on current route-based role
    const endpoint = userRole === 'ADMIN' ? '/api/sse/admin' : '/api/sse/user';
    console.log(`[NotificationContext] Connecting SSE to ${endpoint} acting as ${userRole}`);
    
    const eventSource = new EventSource(endpoint);

    const handleEvent = (event: MessageEvent) => {
      console.log(`[NotificationContext] Received SSE event: ${event.type}`, event.data);
      try {
        const data = JSON.parse(event.data);
        
        // Always refresh unread count on any notification event
        refreshUnreadCount();
        
        // Refresh contracts list if on relevant page (even if we don't reconnect)
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath === '/contracts' || currentPath === '/admin/contracts') {
            mutate('/api/contracts');
          }
        }

        // Handle toast messages based on role and event type
        if (event.type === 'contract_uploaded' && userRole === 'ADMIN') {
          addToast({
            type: 'contract_uploaded',
            title: '🔔 Hợp đồng mới cần duyệt',
            message: 'Có một hợp đồng vừa được tải lên hệ thống.',
            contractId: data.contractId
          });
        } else if (event.type === 'contract_approved' && userRole === 'USER') {
          addToast({
            type: 'contract_approved',
            title: '🎉 Hợp đồng đã được duyệt',
            message: 'Chúc mừng! Hợp đồng của bạn đã được quản trị viên phê duyệt.',
            contractId: data.contractId
          });
        } else if (event.type === 'contract_rejected' && userRole === 'USER') {
          addToast({
            type: 'contract_rejected',
            title: '❌ Hợp đồng bị từ chối',
            message: 'Hợp đồng của bạn đã bị từ chối. Vui lòng kiểm tra lại.',
            contractId: data.contractId
          });
        }
      } catch (err) {
        console.error('[NotificationContext] Error parsing event data:', err);
      }
    };

    eventSource.addEventListener('contract_uploaded', handleEvent);
    eventSource.addEventListener('contract_approved', handleEvent);
    eventSource.addEventListener('contract_rejected', handleEvent);

    eventSource.onopen = () => {
      console.log(`[NotificationContext] SSE Connection opened success for ${userRole}`);
    };

    eventSource.onerror = (err: any) => {
      const state = eventSource.readyState;
      const stateName = state === 0 ? 'CONNECTING' : state === 1 ? 'OPEN' : 'CLOSED';
      console.error(`[NotificationContext] SSE Error [State: ${stateName}]:`, {
        url: endpoint,
        readyState: state,
        originalError: err
      });
    };

    return () => {
      console.log(`[NotificationContext] Closing SSE connection for role: ${userRole}`);
      eventSource.close();
    };
  }, [userRole, refreshUnreadCount, addToast]); // Removed pathname to keep connection stable across navigations within the same role

  return (
    <NotificationContext.Provider value={{ unreadCount, pendingTasks, toasts, removeToast, refreshUnreadCount }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} userRole={userRole} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Internal Toast Components
function ToastContainer({ toasts, removeToast, userRole }: { toasts: Toast[]; removeToast: (id: string) => void; userRole: string }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '10px'
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderLeft: `4px solid ${toast.type === 'contract_rejected' ? '#ef4444' : toast.type === 'contract_approved' ? '#10b981' : '#3b82f6'}`,
          minWidth: '280px',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{toast.title}</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>{toast.message}</div>
          {toast.contractId && (
            <a 
              href={userRole === 'ADMIN' ? `/admin/contracts?id=${toast.contractId}` : `/contracts?id=${toast.contractId}`}
              style={{
                marginTop: '10px',
                fontSize: '0.85rem',
                color: '#3b82f6',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Xem ngay →
            </a>
          )}
          <button 
            onClick={() => removeToast(toast.id)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ✕
          </button>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
