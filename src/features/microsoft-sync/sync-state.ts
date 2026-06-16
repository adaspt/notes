import {
  createSyncStateRecord,
  globalSyncStateId,
  type NotesLocalDatabase,
} from "@/lib/local-data";

export async function markSyncing(database: NotesLocalDatabase, updatedAt = new Date()) {
  const existingSyncState = await database.syncStates.get(globalSyncStateId);
  await database.syncStates.put(
    createSyncStateRecord("syncing", updatedAt.toISOString(), {
      lastSyncedAt: existingSyncState?.lastSyncedAt ?? null,
    }),
  );
}

export async function markSyncFailed(
  database: NotesLocalDatabase,
  message: string,
  updatedAt = new Date(),
) {
  const existingSyncState = await database.syncStates.get(globalSyncStateId);
  await database.syncStates.put(
    createSyncStateRecord("syncFailed", updatedAt.toISOString(), {
      lastSyncedAt: existingSyncState?.lastSyncedAt ?? null,
      message,
    }),
  );
}

export async function markOffline(database: NotesLocalDatabase, updatedAt = new Date()) {
  const existingSyncState = await database.syncStates.get(globalSyncStateId);
  const hasPendingWrites =
    (await database.pendingTaskWrites.count()) > 0 ||
    (await database.pendingNoteWrites.count()) > 0;

  await database.syncStates.put(
    createSyncStateRecord(
      hasPendingWrites ? "offlineChanges" : "offline",
      updatedAt.toISOString(),
      {
        lastSyncedAt: existingSyncState?.lastSyncedAt ?? null,
      },
    ),
  );
}
