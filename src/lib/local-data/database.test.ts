import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vite-plus/test";

import { createLocalDatabase } from "./database";
import {
  localNoteRecordSchema,
  localTaskRecordSchema,
  pendingTaskWriteSchema,
  type LocalNoteRecord,
  type LocalTaskRecord,
} from "./index";

const databases = new Set<ReturnType<typeof createLocalDatabase>>();
const now = "2026-06-15T12:00:00.000Z";

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
  const database = createLocalDatabase(`notes-test-${crypto.randomUUID()}`);
  databases.add(database);
  return database;
}

function createTaskRecord(): LocalTaskRecord {
  return {
    id: "task-local-1",
    remoteId: "todo-task-1",
    title: "Draft IndexedDB schema",
    body: "Keep it aligned with the sync boundary.",
    dueDate: "2026-06-15",
    priority: "high",
    status: "notStarted",
    remoteUpdatedAt: now,
    updatedAt: now,
  };
}

function createNoteRecord(): LocalNoteRecord {
  return {
    id: "note-local-1",
    driveItemId: "drive-item-1",
    projectId: null,
    name: "Inbox Note.md",
    path: "/Inbox Note.md",
    type: "markdown",
    starred: true,
    content: "# Inbox Note\n",
    remoteUpdatedAt: now,
    updatedAt: now,
  };
}

describe("local IndexedDB schema", () => {
  it("opens all Phase 1 object stores", async () => {
    const database = createTestDatabase();

    await database.open();

    expect(database.tables.map((table) => table.name).sort()).toEqual([
      "noteDeltaCursors",
      "notes",
      "pendingNoteWrites",
      "pendingTaskWrites",
      "projects",
      "syncStates",
      "taskDeltaCursors",
      "tasks",
    ]);
  });

  it("persists validated task and pending task write records", async () => {
    const database = createTestDatabase();
    const task = localTaskRecordSchema.parse(createTaskRecord());
    const pendingWrite = pendingTaskWriteSchema.parse({
      taskId: task.id,
      operation: "upsert",
      task,
      updatedAt: now,
    });

    await database.tasks.put(task);
    await database.pendingTaskWrites.put(pendingWrite);

    await expect(database.tasks.get(task.id)).resolves.toEqual(task);
    await expect(database.pendingTaskWrites.get(task.id)).resolves.toEqual(pendingWrite);
  });

  it("validates and persists cached notes", async () => {
    const database = createTestDatabase();
    const note = localNoteRecordSchema.parse(createNoteRecord());

    await database.notes.put(note);

    await expect(database.notes.get(note.id)).resolves.toEqual(note);
  });
});
