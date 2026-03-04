import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SSEManager } from '@/lib/sse';

describe('SSEManager', () => {
  const mockController = {
    enqueue: vi.fn(),
    close: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Private access via any or we could just reset by removing
    (SSEManager as any).removeAdmin(mockController);
  });

  it('should add admin and emit events to them', () => {
    SSEManager.addAdmin(mockController);
    
    SSEManager.emitToAdmins('test_event', { foo: 'bar' });
    
    expect(mockController.enqueue).toHaveBeenCalled();
    const callData = new TextDecoder().decode(mockController.enqueue.mock.calls[0][0]);
    expect(callData).toContain('event: test_event');
    expect(callData).toContain('"foo":"bar"');
  });

  it('should emit to specific user only', () => {
    const user1Controller = { enqueue: vi.fn() } as any;
    const user2Controller = { enqueue: vi.fn() } as any;

    SSEManager.addUser('user1', user1Controller);
    SSEManager.addUser('user2', user2Controller);

    SSEManager.emitToUser('user1', 'msg', { text: 'hi' });

    expect(user1Controller.enqueue).toHaveBeenCalled();
    expect(user2Controller.enqueue).not.toHaveBeenCalled();
  });

  it('should cleanup connection on error', () => {
    const faultyController = {
      enqueue: vi.fn(() => { throw new Error('Dead'); }),
    } as any;

    SSEManager.addAdmin(faultyController);
    SSEManager.emitToAdmins('test', {});
    
    // Total connections should decrease or subsequent emits shouldn't call it
    // We can verify by emitting again and checking call counts
    SSEManager.emitToAdmins('test2', {});
    expect(faultyController.enqueue).toHaveBeenCalledTimes(1); 
  });
});
