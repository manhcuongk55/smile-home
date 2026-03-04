import { EventEmitter } from 'events';

// Type for SSE Controller
type SSEController = ReadableStreamDefaultController;

// Use a global key that persists across reloads in development
const ADMIN_CONNECTIONS_KEY = '__sse_admin_connections__';
const USER_CONNECTIONS_KEY = '__sse_user_connections__';

const GLOBAL_EMITTER_KEY = '__sse_global_emitter__';

if (!(globalThis as any)[GLOBAL_EMITTER_KEY]) {
  (globalThis as any)[GLOBAL_EMITTER_KEY] = new EventEmitter();
  // Increase limit if many connections share the same emitter
  (globalThis as any)[GLOBAL_EMITTER_KEY].setMaxListeners(100);
}

const globalEmitter: EventEmitter = (globalThis as any)[GLOBAL_EMITTER_KEY];
const encoder = new TextEncoder();

export const SSEManager = {
  /**
   * Add an Admin connection
   */
  addAdmin(controller: SSEController) {
    const handler = (data: any) => {
      try {
        const message = `event: ${data.eventName}\ndata: ${JSON.stringify(data.payload)}\n\n`;
        controller.enqueue(encoder.encode(message));
      } catch (err) {
        console.error(`[SSEManager] Failed to send to admin:`, err);
        this.removeAdmin(controller);
      }
    };

    (controller as any)._sseHandler = handler;
    globalEmitter.on('broadcast_admin', handler);
    console.log(`[SSEManager] Admin connection added to global bus.`);
  },

  /**
   * Remove an Admin connection
   */
  removeAdmin(controller: SSEController) {
    const handler = (controller as any)._sseHandler;
    if (handler) {
      globalEmitter.off('broadcast_admin', handler);
    }
    console.log(`[SSEManager] Admin connection removed from global bus.`);
  },

  /**
   * Add a User connection
   */
  addUser(userId: string, controller: SSEController) {
    const handler = (data: any) => {
      if (data.userId === userId) {
        try {
          const message = `event: ${data.eventName}\ndata: ${JSON.stringify(data.payload)}\n\n`;
          controller.enqueue(encoder.encode(message));
          console.log(`[SSEManager] Dispatched ${data.eventName} to User ${userId}`);
        } catch (err) {
          console.error(`[SSEManager] Failed to send to user ${userId}:`, err);
          this.removeUser(userId, controller);
        }
      }
    };

    (controller as any)._sseHandler = handler;
    globalEmitter.on('send_user', handler);
    console.log(`[SSEManager] User ${userId} connection added to global bus.`);
  },

  /**
   * Remove a User connection
   */
  removeUser(userId: string, controller: SSEController) {
    const handler = (controller as any)._sseHandler;
    if (handler) {
      globalEmitter.off('send_user', handler);
    }
    console.log(`[SSEManager] User ${userId} connection removed from global bus.`);
  },

  /**
   * Emit event to all connected Admins
   */
  emitToAdmins(eventName: string, payload: any) {
    console.log(`[SSEManager] Global Broadcast to Admins: ${eventName}`);
    globalEmitter.emit('broadcast_admin', { eventName, payload });
  },

  /**
   * Emit event to a specific User
   */
  emitToUser(userId: string, eventName: string, payload: any) {
    console.log(`[SSEManager] Global Send to User ${userId}: ${eventName}`);
    globalEmitter.emit('send_user', { userId, eventName, payload });
  }
};
