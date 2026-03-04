import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationProvider, useNotification } from './NotificationContext';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/admin'),
}));

// Mock child component to use the hook
const TestComponent = () => {
  const { unreadCount, toasts } = useNotification();
  return (
    <div>
      <div data-testid="count">{unreadCount}</div>
      <div data-testid="toasts-len">{toasts.length}</div>
      {toasts.map(t => <div key={t.id} data-testid="toast-item">{t.title}</div>)}
    </div>
  );
};

describe('NotificationContext (SSE Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window.EventSource as any).reset();
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('userRole', 'ADMIN');
  });

  it('should establish SSE connection and fetch unread count on mount', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ count: 10 }),
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('10');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/notifications/unread-count?role=ADMIN');
  });

  it('should handle incoming SSE events and show toasts', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ count: 5 }),
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const eventSourceInstance = (window.EventSource as any).instances[0];
    if (!eventSourceInstance) {
      throw new Error('EventSource instance not found');
    }
    
    // Simulate SSE event
    await act(async () => {
      const event = {
        type: 'contract_uploaded',
        data: JSON.stringify({ contractId: 'c1', notificationId: 'n1' })
      };
      eventSourceInstance.dispatchEvent(event);
    });

    // Check if toast appears
    await waitFor(() => {
      expect(screen.getByTestId('toasts-len').textContent).toBe('1');
    });
    
    expect(await screen.findByText(/Hợp đồng mới/)).toBeInTheDocument();
    
    // Check if unread count was refreshed
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/notifications/unread-count?role=ADMIN');
    });
  });
});
