import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vite-plus/test";
import type { z } from "zod";

import {
  createLocalDatabase,
  type LocalNoteRecord,
  type LocalTaskRecord,
  type PendingNoteWrite,
  type PendingTaskWrite,
} from "@/lib/local-data";

import type { GraphClient } from "./graph-client";
import { loadInitialMicrosoftData } from "./initial-load";

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
  const database = createLocalDatabase(`microsoft-test-${crypto.randomUUID()}`);
  databases.add(database);
  return database;
}

describe("loadInitialMicrosoftData", () => {
  it("discovers Microsoft data and caches task/project records", async () => {
    const database = createTestDatabase();
    const client: Pick<GraphClient, "delete" | "get" | "getText" | "patch" | "post" | "put"> = {
      delete: async () => {
        throw new Error("Unexpected delete request.");
      },
      get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        return schema.parse(createGraphFixture(pathOrUrl));
      },
      getText: async (pathOrUrl: string) => createGraphContentFixture(pathOrUrl),
      patch: async () => {
        throw new Error("Unexpected patch request.");
      },
      post: async () => {
        throw new Error("Unexpected post request.");
      },
      put: async () => {
        throw new Error("Unexpected put request.");
      },
    };

    const result = await loadInitialMicrosoftData(client, database);

    expect(result.defaultTaskList.id).toBe("default-list");
    expect(result.tasks).toHaveLength(1);
    expect(result.projects).toHaveLength(1);
    expect(result.notes.map((note) => note.name)).toEqual(["Inbox.md", "Checklist.list.md"]);
    await expect(database.tasks.where("remoteId").equals("task-1").first()).resolves.toMatchObject({
      body: "Task notes",
      priority: "high",
      remoteId: "task-1",
      status: "notStarted",
    });
    await expect(database.taskDeltaCursors.get("default-task-list")).resolves.toMatchObject({
      deltaLink:
        "https://graph.microsoft.com/v1.0/me/todo/lists/default-list/tasks/delta?$deltatoken=1",
      listId: "default-list",
    });
    await expect(database.projects.get("project-1")).resolves.toMatchObject({
      driveItemId: "project-1",
      name: "Project 1",
    });
    await expect(
      database.notes.where("driveItemId").equals("project-note").first(),
    ).resolves.toMatchObject({
      content: "- Review delta sync\n",
      projectId: "project-1",
      starred: true,
      type: "list",
    });
  });

  it("pushes pending task writes before pulling fresh task data", async () => {
    const database = createTestDatabase();
    const task = createTaskRecord({
      status: "completed",
      updatedAt: "2026-06-15T12:00:00.000Z",
    });
    const patchRequests: Array<{ body: unknown; path: string }> = [];
    await database.tasks.put(task);
    await database.pendingTaskWrites.put(createPendingTaskWrite(task));

    const client: Pick<GraphClient, "delete" | "get" | "getText" | "patch" | "post" | "put"> = {
      delete: async () => {
        throw new Error("Unexpected delete request.");
      },
      get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        return schema.parse(createGraphFixture(pathOrUrl, { taskStatus: "completed" }));
      },
      getText: async (pathOrUrl: string) => createGraphContentFixture(pathOrUrl),
      patch: async <T>(pathOrUrl: string, schema: z.ZodType<T>, body: unknown) => {
        patchRequests.push({ body, path: pathOrUrl });
        return schema.parse({
          id: "task-1",
          title: "Task 1",
          body: {
            content: "Task notes",
          },
          dueDateTime: {
            dateTime: "2026-06-15T00:00:00.0000000",
            timeZone: "UTC",
          },
          importance: "high",
          status: "completed",
          lastModifiedDateTime: "2026-06-15T12:30:00.0000000Z",
        });
      },
      post: async () => {
        throw new Error("Unexpected post request.");
      },
      put: async () => {
        throw new Error("Unexpected put request.");
      },
    };

    await loadInitialMicrosoftData(client, database);

    expect(patchRequests).toEqual([
      {
        path: "/me/todo/lists/default-list/tasks/task-1",
        body: {
          title: "Task 1",
          body: {
            content: "Task notes",
            contentType: "text",
          },
          dueDateTime: {
            dateTime: "2026-06-15T00:00:00.0000000",
            timeZone: "UTC",
          },
          importance: "high",
          status: "completed",
        },
      },
    ]);
    await expect(database.pendingTaskWrites.get("task-1")).resolves.toBeUndefined();
    await expect(database.tasks.get("task-1")).resolves.toMatchObject({
      remoteUpdatedAt: "2026-06-15T12:30:00.000Z",
      status: "completed",
    });
  });

  it("pushes pending note writes before pulling fresh note data", async () => {
    const database = createTestDatabase();
    const note = createNoteRecord({
      content: "# Updated inbox\n",
      updatedAt: "2026-06-15T12:00:00.000Z",
    });
    const putRequests: Array<{ body: BodyInit; path: string }> = [];
    await database.notes.put(note);
    await database.pendingNoteWrites.put(createPendingNoteWrite(note));

    const client: Pick<GraphClient, "delete" | "get" | "getText" | "patch" | "post" | "put"> = {
      delete: async () => {
        throw new Error("Unexpected delete request.");
      },
      get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        return schema.parse(createGraphFixture(pathOrUrl));
      },
      getText: async (pathOrUrl: string) => createGraphContentFixture(pathOrUrl),
      patch: async () => {
        throw new Error("Unexpected patch request.");
      },
      post: async () => {
        throw new Error("Unexpected post request.");
      },
      put: async <T>(pathOrUrl: string, schema: z.ZodType<T>, body: BodyInit) => {
        putRequests.push({ body, path: pathOrUrl });
        return schema.parse({
          id: "inbox-note",
          name: "Inbox.md",
          file: {},
          lastModifiedDateTime: "2026-06-15T12:30:00.0000000Z",
        });
      },
    };

    await loadInitialMicrosoftData(client, database);

    expect(putRequests).toEqual([
      {
        path: "/me/drive/items/inbox-note/content",
        body: "---\ntype: markdown\nstarred: false\n---\n# Updated inbox\n",
      },
    ]);
    await expect(database.pendingNoteWrites.get("note-1")).resolves.toBeUndefined();
  });
});

function createGraphFixture(
  pathOrUrl: string,
  options: {
    taskStatus?: "notStarted" | "completed" | "deferred";
  } = {},
) {
  if (pathOrUrl === "/me/todo/lists") {
    return {
      value: [
        {
          id: "flagged-list",
          displayName: "Flagged email",
          wellknownListName: "flaggedEmails",
        },
        {
          id: "default-list",
          displayName: "Tasks",
          wellknownListName: "defaultList",
        },
      ],
    };
  }

  if (pathOrUrl === "/me/todo/lists/default-list/tasks/delta") {
    return {
      value: [
        {
          id: "task-1",
          title: "Task 1",
          body: {
            content: "Task notes",
          },
          dueDateTime: {
            dateTime: "2026-06-15T00:00:00.0000000",
            timeZone: "UTC",
          },
          importance: "high",
          status: options.taskStatus ?? "notStarted",
          lastModifiedDateTime:
            options.taskStatus === "completed"
              ? "2026-06-15T12:30:00.0000000Z"
              : "2026-06-15T09:00:00.0000000Z",
        },
      ],
      "@odata.deltaLink":
        "https://graph.microsoft.com/v1.0/me/todo/lists/default-list/tasks/delta?$deltatoken=1",
    };
  }

  if (pathOrUrl.startsWith("/me/drive/special/approot?")) {
    return {
      id: "app-root",
      name: "Notes",
      parentReference: {
        driveId: "drive-1",
      },
    };
  }

  if (pathOrUrl.startsWith("/drives/drive-1/items/app-root/delta?")) {
    return {
      value: [
        {
          id: "inbox-note",
          name: "Inbox.md",
          file: {},
          parentReference: {
            id: "app-root",
          },
          lastModifiedDateTime: "2026-06-15T10:00:00.0000000Z",
        },
        {
          id: "project-1",
          name: "Project 1",
          folder: {},
          parentReference: {
            id: "app-root",
          },
          lastModifiedDateTime: "2026-06-15T10:30:00.0000000Z",
        },
        {
          id: "project-note",
          name: "Checklist.list.md",
          file: {},
          parentReference: {
            id: "project-1",
          },
          lastModifiedDateTime: "2026-06-15T11:00:00.0000000Z",
        },
      ],
      "@odata.deltaLink":
        "https://graph.microsoft.com/v1.0/drives/drive-1/items/app-root/delta?$deltatoken=1",
    };
  }

  throw new Error(`Unexpected path: ${pathOrUrl}`);
}

function createGraphContentFixture(pathOrUrl: string) {
  if (pathOrUrl === "/me/drive/items/inbox-note/content") {
    return "# Inbox\n";
  }

  if (pathOrUrl === "/me/drive/items/project-note/content") {
    return "---\ntype: list\nstarred: true\n---\n- Review delta sync\n";
  }

  throw new Error(`Unexpected content path: ${pathOrUrl}`);
}

function createTaskRecord(overrides: Partial<LocalTaskRecord> = {}): LocalTaskRecord {
  return {
    id: "task-1",
    remoteId: "task-1",
    title: "Task 1",
    body: "Task notes",
    dueDate: "2026-06-15",
    priority: "high",
    status: "notStarted",
    remoteUpdatedAt: "2026-06-15T09:00:00.000Z",
    updatedAt: "2026-06-15T09:00:00.000Z",
    ...overrides,
  };
}

function createNoteRecord(overrides: Partial<LocalNoteRecord> = {}): LocalNoteRecord {
  return {
    id: "note-1",
    driveItemId: "inbox-note",
    projectId: null,
    name: "Inbox.md",
    path: "/Inbox.md",
    type: "markdown",
    starred: false,
    content: "# Inbox\n",
    remoteUpdatedAt: "2026-06-15T09:00:00.000Z",
    updatedAt: "2026-06-15T09:00:00.000Z",
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

function createPendingNoteWrite(note: LocalNoteRecord): PendingNoteWrite {
  return {
    noteId: note.id,
    operation: "upsert",
    note,
    updatedAt: note.updatedAt,
  };
}
