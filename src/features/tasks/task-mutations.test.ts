import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vite-plus/test";

import { createLocalDatabase, createSyncStateRecord, type LocalTaskRecord } from "@/lib/local-data";

import {
  completeTask,
  createTask,
  deferTaskToBacklog,
  editTask,
  getNextMondayDateKey,
  getNextMonthFirstDateKey,
  getTomorrowDateKey,
  moveTaskToNextMonth,
  moveTaskToNextWeek,
  moveTaskToToday,
  moveTaskToTomorrow,
} from "./task-mutations";

const databases = new Set<ReturnType<typeof createLocalDatabase>>();
const now = new Date("2026-06-15T12:00:00.000Z");
const nowIso = "2026-06-15T12:00:00.000Z";

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
  const database = createLocalDatabase(`task-mutations-test-${crypto.randomUUID()}`);
  databases.add(database);
  return database;
}

function createTaskRecord(overrides: Partial<LocalTaskRecord> = {}): LocalTaskRecord {
  return {
    id: "task-1",
    remoteId: "task-1",
    title: "Task 1",
    body: "",
    dueDate: null,
    priority: "normal",
    status: "notStarted",
    remoteUpdatedAt: nowIso,
    updatedAt: nowIso,
    ...overrides,
  };
}

describe("task mutation date helpers", () => {
  it("calculates reschedule shortcut dates", () => {
    expect(getTomorrowDateKey(now)).toBe("2026-06-16");
    expect(getNextMondayDateKey(now)).toBe("2026-06-22");
    expect(getNextMondayDateKey(new Date("2026-06-14T12:00:00.000Z"))).toBe("2026-06-15");
    expect(getNextMonthFirstDateKey(now)).toBe("2026-07-01");
  });
});

describe("task mutations", () => {
  it("creates a local task and queues it for sync", async () => {
    const database = createTestDatabase();
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    const task = await createTask(
      {
        title: "  New task  ",
        dueDate: "2026-06-15",
      },
      { database, now },
    );

    expect(task).toMatchObject({
      remoteId: null,
      title: "New task",
      body: "",
      dueDate: "2026-06-15",
      priority: "normal",
      status: "notStarted",
      remoteUpdatedAt: null,
      updatedAt: nowIso,
    });
    expect(task.id).toMatch(/^[0-9A-Za-z]{10}$/);
    await expect(database.tasks.get(task.id)).resolves.toEqual(task);
    await expect(database.pendingTaskWrites.get(task.id)).resolves.toMatchObject({
      operation: "upsert",
      task,
      updatedAt: nowIso,
    });
    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "offlineChanges",
    });
  });

  it("requires a title when creating a task", async () => {
    const database = createTestDatabase();

    await expect(createTask({ title: "   " }, { database, now })).rejects.toThrow(
      "Task title is required.",
    );
    await expect(database.tasks.count()).resolves.toBe(0);
    await expect(database.pendingTaskWrites.count()).resolves.toBe(0);
  });

  it("completes a task and stores the latest pending write", async () => {
    const database = createTestDatabase();
    await database.tasks.put(createTaskRecord());

    await completeTask("task-1", { database, now });

    await expect(database.tasks.get("task-1")).resolves.toMatchObject({
      status: "completed",
      updatedAt: nowIso,
    });
    await expect(database.pendingTaskWrites.get("task-1")).resolves.toMatchObject({
      operation: "upsert",
      task: {
        status: "completed",
      },
    });
    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      status: "offlineChanges",
    });
  });

  it("reschedules tasks to today, tomorrow, next week, and next month", async () => {
    const database = createTestDatabase();
    await database.tasks.put(createTaskRecord({ status: "deferred" }));

    await moveTaskToToday("task-1", { database, now });
    await expect(database.tasks.get("task-1")).resolves.toMatchObject({
      dueDate: "2026-06-15",
      status: "notStarted",
    });

    await moveTaskToTomorrow("task-1", { database, now });
    await expect(database.tasks.get("task-1")).resolves.toMatchObject({
      dueDate: "2026-06-16",
      status: "notStarted",
    });

    await moveTaskToNextWeek("task-1", { database, now });
    await expect(database.tasks.get("task-1")).resolves.toMatchObject({
      dueDate: "2026-06-22",
      status: "notStarted",
    });

    await moveTaskToNextMonth("task-1", { database, now });
    await expect(database.tasks.get("task-1")).resolves.toMatchObject({
      dueDate: "2026-07-01",
      status: "notStarted",
    });
    await expect(database.pendingTaskWrites.get("task-1")).resolves.toMatchObject({
      task: {
        dueDate: "2026-07-01",
      },
    });
  });

  it("defers tasks to backlog without losing the last synced timestamp", async () => {
    const database = createTestDatabase();
    await database.tasks.put(createTaskRecord());
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    await deferTaskToBacklog("task-1", { database, now });

    await expect(database.tasks.get("task-1")).resolves.toMatchObject({
      status: "deferred",
    });
    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "offlineChanges",
    });
  });

  it("edits task details and collapses the latest pending write", async () => {
    const database = createTestDatabase();
    await database.tasks.put(createTaskRecord());

    await editTask(
      "task-1",
      {
        title: "Updated title",
        body: "Updated notes",
        dueDate: "2026-06-20",
        priority: "low",
        status: "deferred",
      },
      { database, now },
    );

    await expect(database.tasks.get("task-1")).resolves.toMatchObject({
      title: "Updated title",
      body: "Updated notes",
      dueDate: "2026-06-20",
      priority: "low",
      status: "deferred",
    });
    await expect(database.pendingTaskWrites.get("task-1")).resolves.toMatchObject({
      task: {
        title: "Updated title",
        status: "deferred",
      },
      updatedAt: nowIso,
    });
  });
});
