import { globalSyncStateId, type SyncStateRecord, type SyncStatus } from "./schemas";

export const initialSyncStatus: SyncStatus = "offline";

export function createSyncStateRecord(
  status: SyncStatus,
  updatedAt: string,
  options: {
    lastSyncedAt?: string | null;
    message?: string | null;
  } = {},
): SyncStateRecord {
  return {
    id: globalSyncStateId,
    status,
    message: options.message ?? null,
    lastSyncedAt: options.lastSyncedAt ?? null,
    updatedAt,
  };
}
