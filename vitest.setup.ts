import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock EventSource
class MockEventSource {
  onmessage: ((ev: any) => any) | null = null;
  onerror: ((ev: any) => any) | null = null;
  url: string;
  listeners: Record<string, Function[]> = {};
  static instances: MockEventSource[] = [];

  static reset() {
    MockEventSource.instances = [];
  }

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: Function) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: Function) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event: any) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(l => l(event));
    }
    if (event.type === 'message' && this.onmessage) {
      this.onmessage(event);
    }
  }

  close() {}
}

Object.defineProperty(window, 'EventSource', { value: MockEventSource });

// Mock CustomEvent if not available
if (typeof global.CustomEvent !== 'function') {
  class CustomEvent extends Event {
    detail: any;
    constructor(event: string, params: any = { bubbles: false, cancelable: false, detail: null }) {
      super(event, params);
      this.detail = params.detail;
    }
  }
  global.CustomEvent = CustomEvent as any;
}

global.fetch = vi.fn();
