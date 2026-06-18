import { createContext } from "react";

export type CloudSyncStatus = "idle" | "syncing" | "error";

export interface CloudSync {
  status: CloudSyncStatus;
  syncNow: () => Promise<void>;
}

export const CloudSyncContext = createContext<CloudSync | null>(null);
