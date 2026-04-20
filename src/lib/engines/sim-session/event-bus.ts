/**
 * Typed event dispatcher for cross-engine communication.
 * Engines NEVER call each other directly — only via this bus.
 *
 * Features:
 * - Type-safe SimEvent dispatch
 * - Per-handler error isolation (one bad handler doesn't break others)
 * - Wildcard '*' listener receives all events
 * - Re-entrant safe (emit inside handler is allowed)
 */

import type { SimEvent } from '../types';

export type EventHandler = (event: SimEvent) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private wildcardHandlers = new Set<EventHandler>();

  on(eventType: SimEvent['type'] | '*', handler: EventHandler): void {
    if (eventType === '*') {
      this.wildcardHandlers.add(handler);
      return;
    }
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  off(eventType: SimEvent['type'] | '*', handler: EventHandler): void {
    if (eventType === '*') {
      this.wildcardHandlers.delete(handler);
      return;
    }
    this.handlers.get(eventType)?.delete(handler);
  }

  emit(event: SimEvent): void {
    // Typed handlers
    const typed = this.handlers.get(event.type);
    if (typed) {
      for (const handler of typed) {
        try {
          handler(event);
        } catch (err) {
          // Isolate: emit ENGINE_FAILURE but guard against infinite recursion
          if (event.type !== 'ENGINE_FAILURE') {
            this.emit({
              type: 'ENGINE_FAILURE',
              engine_id: 'event-bus',
              error: err instanceof Error ? err : new Error(String(err)),
            });
          }
        }
      }
    }

    // Wildcard handlers
    for (const handler of this.wildcardHandlers) {
      try {
        handler(event);
      } catch {
        // Wildcard handler failure is silently swallowed — never cascades
      }
    }
  }

  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
  }

  listenerCount(eventType?: SimEvent['type']): number {
    if (!eventType) {
      let count = this.wildcardHandlers.size;
      for (const set of this.handlers.values()) {
        count += set.size;
      }
      return count;
    }
    return (this.handlers.get(eventType)?.size ?? 0) + this.wildcardHandlers.size;
  }
}
