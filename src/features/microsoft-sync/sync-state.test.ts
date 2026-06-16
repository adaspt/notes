import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vite-plus/test";

import {
  createLocalDatabase,
  createSyncStateRecord,
  type LocalTaskRecord,
  type PendingTaskWrite,
} from "@/lib/local-data";

import { markOffline, markSyncFailed, markSyncing } from "./sync-state";

const databases = new Set<ReturnType<typeof createLocalDatabase>>();

afterEach(async () => {
  await Promise.all(
    [...databases].map(async (database) => {
      database.close();
      await database.delete();
    }),
  );
  databases.clear();
});

function createTestDatabase() {
  const database = createLocalDatabase(`sync-state-test-${crypto.randomUUID()}`);
  databases.add(database);
  return database;
}

describe("sync state helpers", () => {
  it("marks syncing without losing the last synced timestamp", async () => {
    const database = createTestDatabase();
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    await markSyncing(database, new Date("2026-06-15T11:00:00.000Z"));

    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "syncing",
      updatedAt: "2026-06-15T11:00:00.000Z",
    });
  });

  it("marks sync failures without losing the last synced timestamp", async () => {
    const database = createTestDatabase();
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    await markSyncFailed(
      database,
      "Microsoft Graph request failed.",
      new Date("2026-06-15T11:00:00.000Z"),
    );

    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      message: "Microsoft Graph request failed.",
      status: "syncFailed",
      updatedAt: "2026-06-15T11:00:00.000Z",
    });
  });

  it("marks offline changes when pending writes exist", async () => {
    const database = createTestDatabase();
    const task = createTaskRecord();
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );
    await database.tasks.put(task);
    await database.pendingTaskWrites.put(createPendingTaskWrite(task));

    await markOffline(database, new Date("2026-06-15T11:00:00.000Z"));

    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "offlineChanges",
      updatedAt: "2026-06-15T11:00:00.000Z",
    });
  });

  it("marks offline when there are no pending writes", async () => {
    const database = createTestDatabase();
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    await markOffline(database, new Date("2026-06-15T11:00:00.000Z"));

    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "offline",
      updatedAt: "2026-06-15T11:00:00.000Z",
    });
  });
});

function createTaskRecord(): LocalTaskRecord {
  return {
    id: "task-1",
    remoteId: "remote-task-1",
    title: "Review sync state",
    body: "",
    dueDate: null,
    priority: "normal",
    status: "notStarted",
    remoteUpdatedAt: "2026-06-15T09:00:00.000Z",
    updatedAt: "2026-06-15T10:30:00.000Z",
  };
}

function createPendingTaskWrite(task: LocalTaskRecord): PendingTaskWrite {
  return {
    taskId: task.id,
    operation: "upsert",
    task,
    updatedAt: task.updatedAt,
  };
}
