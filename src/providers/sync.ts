import { createContext, createElement, useEffect, type ReactNode } from 'react';
import type { SyncTasksService } from './syncTasks';

export class SyncService {
  constructor(syncTasksService: SyncTasksService) {
    this.#syncTasksService = syncTasksService;
  }

  #syncTasksService: SyncTasksService;

  async sync() {
    await this.#syncTasksService.sync();
  }
}

const SyncContext = createContext<SyncService | null>(null);

interface SyncProviderProps {
  syncService: SyncService;
  children: ReactNode;
}

export function SyncProvider({ syncService, children }: SyncProviderProps) {
  useEffect(() => {
    syncService.sync();
  }, [syncService]);

  return createElement(SyncContext.Provider, { value: syncService }, children);
}
