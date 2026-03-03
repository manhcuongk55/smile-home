import { EventEmitter } from 'events';

// Global EventEmitter singleton
const globalForEvents = global as unknown as { eventEmitter: EventEmitter };
export const eventEmitter = globalForEvents.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') globalForEvents.eventEmitter = eventEmitter;

export const CONTRACT_EVENT = 'contract_change';

export function emitContractChange() {
    eventEmitter.emit(CONTRACT_EVENT);
}
