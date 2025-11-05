import { createContext, createElement, useContext, useEffect, type ReactNode } from 'react';
import type { SyncTasksService } from './syncTasks';
import type { SyncNotesService } from './syncNotes';

export class SyncService {
  constructor(syncTasksService: SyncTasksService, syncNotesService: SyncNotesService) {
    this.#syncTasksService = syncTasksService;
    this.#syncNotesService = syncNotesService;
  }

  #syncTasksService: SyncTasksService;
  #syncNotesService: SyncNotesService;

  async sync() {
    await this.#syncTasksService.sync();
    await this.#syncNotesService.sync();
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

export function useSync() {
  const syncService = useContext(SyncContext);
  if (!syncService) {
    throw new Error('useSync must be used within a SyncProvider');
  }

  return syncService;
}
