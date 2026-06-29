import { createContext } from "react";

export interface SyncClient {
  syncNow: () => Promise<void>;
  subscribe: (fn: (isSyncing: boolean) => void) => () => void;
}

export const SyncContext = createContext<SyncClient | null>(null);
