import { createContext, createElement, useContext, useEffect, type ReactNode } from 'react';
import type { SyncService } from './syncService';
import { useIsAuthenticated } from '@azure/msal-react';

export class SyncScheduleService {
  constructor(syncService: SyncService, intervalMs: number) {
    this.#syncService = syncService;
    this.#intervalMs = intervalMs;
  }

  #syncService: SyncService;
  #intervalMs: number;
  #synchronizing = false;
  #dirty = false;
  #subscribers: Array<() => void> = [];

  get isSynchronizing() {
    return this.#synchronizing;
  }

  set isSynchronizing(value: boolean) {
    this.#synchronizing = value;
    this.#notifySubscribers();
  }

  requestSync() {
    if (this.#synchronizing) {
      this.#dirty = true;
      return;
    }

    this.isSynchronizing = true;
    void this.#runSyncLoop();
  }

  beginPeriodicSync() {
    const intervalId = setInterval(() => {
      this.requestSync();
    }, this.#intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }

  subscribe(subscriber: () => void) {
    this.#subscribers.push(subscriber);

    return () => {
      this.#subscribers = this.#subscribers.filter((x) => x !== subscriber);
    };
  }

  async #runSyncLoop(): Promise<void> {
    try {
      do {
        this.#dirty = false;
        await this.#syncService.sync();
      } while (this.#dirty);
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      this.isSynchronizing = false;
    }
  }

  #notifySubscribers() {
    for (const subscriber of this.#subscribers) {
      subscriber();
    }
  }
}

const SyncScheduleContext = createContext<SyncScheduleService | null>(null);

export function SyncScheduleProvider({ value, children }: { value: SyncScheduleService; children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      value.requestSync();
      return value.beginPeriodicSync();
    }
  }, [isAuthenticated, value]);

  return createElement(SyncScheduleContext.Provider, { value }, children);
}

export function useSyncScheduleService(): SyncScheduleService {
  const context = useContext(SyncScheduleContext);
  if (!context) {
    throw new Error('useSyncScheduleService must be used within a SyncScheduleServiceProvider');
  }

  return context;
}
