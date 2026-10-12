import type { ZexEvent, EventHandler } from './types.js';

export class EventBus {
  private handlers = new Map<string, Set<EventHandler<any>>>();

  /**
   * Subscribes a handler to an event name.
   */
  public on<T = unknown>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler as EventHandler<any>);

    return () => this.off(eventName, handler);
  }

  /**
   * Unsubscribes a handler from an event name.
   */
  public off<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    const set = this.handlers.get(eventName);
    if (set) {
      set.delete(handler as EventHandler<any>);
      if (set.size === 0) {
        this.handlers.delete(eventName);
      }
    }
  }

  /**
   * Emits an event asynchronously to all registered listeners.
   * Isolates listener exceptions so one failing handler does not disrupt others.
   */
  public async emit<T = unknown>(
    name: string,
    params: {
      tenantId: string;
      payload: T;
      sourceModule?: string;
      userId?: string;
    },
  ): Promise<void> {
    const event: ZexEvent<T> = {
      name,
      tenantId: params.tenantId,
      timestamp: new Date(),
      payload: params.payload,
      sourceModule: params.sourceModule,
      userId: params.userId,
    };

    const listeners = this.handlers.get(name);
    if (!listeners || listeners.size === 0) {
      return;
    }

    const promises: Promise<void>[] = [];
    for (const listener of listeners) {
      try {
        const result = listener(event);
        if (result instanceof Promise) {
          promises.push(
            result.catch((err) => {
              console.error(`[EventBus] Unhandled error in listener for '${name}':`, err);
            }),
          );
        }
      } catch (err) {
        console.error(`[EventBus] Synchronous error in listener for '${name}':`, err);
      }
    }

    await Promise.all(promises);
  }

  /**
   * Clears all registered handlers (used in tests/teardown).
   */
  public clear(): void {
    this.handlers.clear();
  }
}

export const globalEventBus = new EventBus();
