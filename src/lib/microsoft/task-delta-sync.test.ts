import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vite-plus/test";
import type { z } from "zod";

import {
  createLocalDatabase,
  defaultTaskDeltaCursorId,
  type LocalTaskRecord,
  type PendingTaskWrite,
} from "@/lib/local-data";

import type { GraphClient } from "./graph-client";
import { syncTodoTasksWithDelta } from "./task-delta-sync";

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
  const database = createLocalDatabase(`task-delta-test-${crypto.randomUUID()}`);
  databases.add(database);
  return database;
}

describe("syncTodoTasksWithDelta", () => {
  it("loads initial delta pages, applies deletes, and stores the final cursor", async () => {
    const database = createTestDatabase();
    const requests: string[] = [];
    await database.tasks.put(createTaskRecord({ id: "local-delete", remoteId: "remote-delete" }));

    const client: Pick<GraphClient, "get"> = {
      get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        requests.push(pathOrUrl);

        if (pathOrUrl === "/me/todo/lists/default-list/tasks/delta") {
          return schema.parse({
            value: [createGraphTask({ id: "remote-1", title: "Remote one" })],
            "@odata.nextLink": "https://graph.test/page-2",
          });
        }

        return schema.parse({
          value: [
            {
              id: "remote-delete",
              "@removed": { reason: "deleted" },
            },
          ],
          "@odata.deltaLink": "https://graph.test/delta?token=1",
        });
      },
    };

    const result = await syncTodoTasksWithDelta(client, "default-list", database, now);

    expect(requests).toEqual([
      "/me/todo/lists/default-list/tasks/delta",
      "https://graph.test/page-2",
    ]);
    expect(result.changedRemoteItems).toBe(2);
    await expect(database.tasks.get("local-delete")).resolves.toBeUndefined();
    await expect(
      database.tasks.where("remoteId").equals("remote-1").first(),
    ).resolves.toMatchObject({
      id: expect.stringMatching(/^[0-9A-Za-z]{10}$/),
      remoteId: "remote-1",
      title: "Remote one",
    });
    await expect(database.taskDeltaCursors.get(defaultTaskDeltaCursorId)).resolves.toMatchObject({
      deltaLink: "https://graph.test/delta?token=1",
      listId: "default-list",
    });
  });

  it("uses a saved delta link for later syncs", async () => {
    const database = createTestDatabase();
    const requests: string[] = [];
    await database.tasks.put(createTaskRecord({ id: "local-1", remoteId: "remote-1" }));
    await database.taskDeltaCursors.put({
      id: defaultTaskDeltaCursorId,
      listId: "default-list",
      deltaLink: "https://graph.test/delta?token=1",
      updatedAt: now,
    });

    const client: Pick<GraphClient, "get"> = {
      get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        requests.push(pathOrUrl);
        return schema.parse({
          value: [createGraphTask({ id: "remote-1", title: "Updated remote" })],
          "@odata.deltaLink": "https://graph.test/delta?token=2",
        });
      },
    };

    await syncTodoTasksWithDelta(client, "default-list", database, now);

    expect(requests).toEqual(["https://graph.test/delta?token=1"]);
    await expect(database.tasks.get("local-1")).resolves.toMatchObject({
      remoteId: "remote-1",
      title: "Updated remote",
    });
  });

  it("does not overwrite pending local task writes with remote delta updates", async () => {
    const database = createTestDatabase();
    const task = createTaskRecord({
      id: "local-1",
      remoteId: "remote-1",
      title: "Local title",
      updatedAt: "2026-06-15T13:00:00.000Z",
    });
    await database.tasks.put(task);
    await database.pendingTaskWrites.put(createPendingTaskWrite(task));

    const client: Pick<GraphClient, "get"> = {
      get: async <T>(_pathOrUrl: string, schema: z.ZodType<T>) =>
        schema.parse({
          value: [createGraphTask({ id: "remote-1", title: "Remote title" })],
          "@odata.deltaLink": "https://graph.test/delta?token=1",
        }),
    };

    await syncTodoTasksWithDelta(client, "default-list", database, now);

    await expect(database.tasks.get("local-1")).resolves.toMatchObject({
      title: "Local title",
    });
    await expect(database.pendingTaskWrites.get("local-1")).resolves.toBeDefined();
  });

  it("fails without advancing the cursor when a remotely deleted task has a pending local write", async () => {
    const database = createTestDatabase();
    const task = createTaskRecord({ id: "local-1", remoteId: "remote-1" });
    await database.tasks.put(task);
    await database.pendingTaskWrites.put(createPendingTaskWrite(task));

    const client: Pick<GraphClient, "get"> = {
      get: async <T>(_pathOrUrl: string, schema: z.ZodType<T>) =>
        schema.parse({
          value: [
            {
              id: "remote-1",
              "@removed": { reason: "deleted" },
            },
          ],
          "@odata.deltaLink": "https://graph.test/delta?token=1",
        }),
    };

    await expect(syncTodoTasksWithDelta(client, "default-list", database, now)).rejects.toThrow(
      "A locally changed task was deleted in Microsoft To Do before sync completed.",
    );
    await expect(database.tasks.get("local-1")).resolves.toBeDefined();
    await expect(database.taskDeltaCursors.get(defaultTaskDeltaCursorId)).resolves.toBeUndefined();
  });
});

function createTaskRecord(overrides: Partial<LocalTaskRecord> = {}): LocalTaskRecord {
  return {
    id: "local-1",
    remoteId: "remote-1",
    title: "Task 1",
    body: "",
    dueDate: null,
    priority: "normal",
    status: "notStarted",
    remoteUpdatedAt: now,
    updatedAt: now,
    ...overrides,
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

function createGraphTask(overrides: { id: string; title: string }) {
  return {
    id: overrides.id,
    title: overrides.title,
    body: {
      content: "",
    },
    importance: "normal",
    status: "notStarted",
    lastModifiedDateTime: now,
  };
}
