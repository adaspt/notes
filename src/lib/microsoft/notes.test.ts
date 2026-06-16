import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vite-plus/test";
import type { z } from "zod";

import {
  createLocalDatabase,
  type LocalNoteRecord,
  type LocalProjectRecord,
  type PendingNoteWrite,
} from "@/lib/local-data";

import { GraphApiError, type GraphClient } from "./graph-client";
import { pushPendingNoteWrites, serializeNoteFileContent } from "./notes";

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
  const database = createLocalDatabase(`notes-sync-test-${crypto.randomUUID()}`);
  databases.add(database);
  return database;
}

describe("note write sync", () => {
  it("serializes note frontmatter and body", () => {
    expect(
      serializeNoteFileContent(
        createNoteRecord({
          content: "# Updated\n",
          starred: true,
        }),
      ),
    ).toBe("---\ntype: markdown\nstarred: true\n---\n# Updated\n");
  });

  it("uploads existing note content and clears the pending write", async () => {
    const database = createTestDatabase();
    const note = createNoteRecord({ content: "# Updated\n" });
    const putRequests: Array<{ body: BodyInit; path: string }> = [];
    await database.notes.put(note);
    await database.pendingNoteWrites.put(createPendingNoteWrite(note));

    const client = createNoteWriteClient({
      put: async <T>(pathOrUrl: string, schema: z.ZodType<T>, body: BodyInit) => {
        putRequests.push({ body, path: pathOrUrl });
        return schema.parse(createDriveItemFixture({ id: "note-1" }));
      },
    });

    await pushPendingNoteWrites(client, database);

    expect(putRequests).toEqual([
      {
        path: "/me/drive/items/note-1/content",
        body: "---\ntype: markdown\nstarred: false\n---\n# Updated\n",
      },
    ]);
    await expect(database.pendingNoteWrites.get(note.id)).resolves.toBeUndefined();
    await expect(database.notes.get(note.id)).resolves.toMatchObject({
      driveItemId: "note-1",
      remoteUpdatedAt: "2026-06-15T12:30:00.000Z",
    });
  });

  it("creates new notes under the app root or project folder", async () => {
    const database = createTestDatabase();
    const inboxNote = createNoteRecord({
      id: "inbox-local",
      driveItemId: null,
      name: "Inbox.md",
      path: "/Inbox.md",
    });
    const projectNote = createNoteRecord({
      id: "project-local",
      driveItemId: null,
      name: "Project.md",
      path: "/Project/Project.md",
      projectId: "project-1",
    });
    const putRequests: string[] = [];
    await database.projects.put(createProjectRecord());
    await database.notes.bulkPut([inboxNote, projectNote]);
    await database.pendingNoteWrites.bulkPut([
      createPendingNoteWrite(inboxNote),
      createPendingNoteWrite(projectNote),
    ]);

    const client = createNoteWriteClient({
      put: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        putRequests.push(pathOrUrl);
        return schema.parse(
          createDriveItemFixture({
            id: pathOrUrl.includes("Project.md") ? "project-note" : "inbox-note",
          }),
        );
      },
    });

    await pushPendingNoteWrites(client, database);

    expect(putRequests).toEqual([
      "/me/drive/items/app-root:/Inbox.md:/content",
      "/me/drive/items/project-1:/Project.md:/content",
    ]);
    await expect(database.notes.get("inbox-local")).resolves.toMatchObject({
      driveItemId: "inbox-note",
    });
    await expect(database.notes.get("project-local")).resolves.toMatchObject({
      driveItemId: "project-note",
    });
    await expect(database.pendingNoteWrites.count()).resolves.toBe(0);
  });

  it("recreates locally changed notes that were deleted remotely before upload", async () => {
    const database = createTestDatabase();
    const note = createNoteRecord({ content: "# Local wins\n" });
    const putRequests: string[] = [];
    await database.notes.put(note);
    await database.pendingNoteWrites.put(createPendingNoteWrite(note));

    const client = createNoteWriteClient({
      put: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        putRequests.push(pathOrUrl);
        if (pathOrUrl === "/me/drive/items/note-1/content") {
          throw new GraphApiError(404, "Deleted");
        }

        return schema.parse(createDriveItemFixture({ id: "recreated-note" }));
      },
    });

    await pushPendingNoteWrites(client, database);

    expect(putRequests).toEqual([
      "/me/drive/items/note-1/content",
      "/me/drive/items/app-root:/Note.md:/content",
    ]);
    await expect(database.notes.get(note.id)).resolves.toMatchObject({
      driveItemId: "recreated-note",
      remoteUpdatedAt: "2026-06-15T12:30:00.000Z",
    });
    await expect(database.pendingNoteWrites.get(note.id)).resolves.toBeUndefined();
  });

  it("keeps a newer pending write when the note changes during upload", async () => {
    const database = createTestDatabase();
    const note = createNoteRecord({
      driveItemId: null,
      updatedAt: "2026-06-15T12:00:00.000Z",
    });
    await database.notes.put(note);
    await database.pendingNoteWrites.put(createPendingNoteWrite(note));

    const client = createNoteWriteClient({
      put: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        const changedNote = {
          ...note,
          content: "# Changed again\n",
          updatedAt: "2026-06-15T12:05:00.000Z",
        };
        await database.notes.put(changedNote);
        await database.pendingNoteWrites.put(createPendingNoteWrite(changedNote));

        expect(pathOrUrl).toBe("/me/drive/items/app-root:/Note.md:/content");
        return schema.parse(createDriveItemFixture({ id: "new-note-1" }));
      },
    });

    await pushPendingNoteWrites(client, database);

    await expect(database.notes.get(note.id)).resolves.toMatchObject({
      content: "# Changed again\n",
      driveItemId: "new-note-1",
    });
    await expect(database.pendingNoteWrites.get(note.id)).resolves.toMatchObject({
      note: {
        content: "# Changed again\n",
        driveItemId: "new-note-1",
      },
      updatedAt: "2026-06-15T12:05:00.000Z",
    });
  });

  it("deletes a queued remote note and clears the pending write", async () => {
    const database = createTestDatabase();
    const deleteRequests: string[] = [];
    const note = createNoteRecord();
    await database.notes.put(note);
    await database.pendingNoteWrites.put(createPendingNoteDeleteWrite(note));

    const client = createNoteWriteClient({
      delete: async (pathOrUrl: string) => {
        deleteRequests.push(pathOrUrl);
      },
    });

    await pushPendingNoteWrites(client, database);

    expect(deleteRequests).toEqual(["/me/drive/items/note-1"]);
    await expect(database.notes.get(note.id)).resolves.toBeUndefined();
    await expect(database.pendingNoteWrites.get(note.id)).resolves.toBeUndefined();
  });

  it("clears a queued local-only note delete without calling Graph", async () => {
    const database = createTestDatabase();
    const deleteRequests: string[] = [];
    await database.pendingNoteWrites.put({
      noteId: "local-note",
      operation: "delete",
      driveItemId: null,
      note: null,
      updatedAt: now,
    });

    const client = createNoteWriteClient({
      delete: async (pathOrUrl: string) => {
        deleteRequests.push(pathOrUrl);
      },
    });

    await pushPendingNoteWrites(client, database);

    expect(deleteRequests).toEqual([]);
    await expect(database.pendingNoteWrites.get("local-note")).resolves.toBeUndefined();
  });
});

function createNoteWriteClient(overrides: {
  delete?: Pick<GraphClient, "delete">["delete"];
  put?: Pick<GraphClient, "put">["put"];
}): Pick<GraphClient, "delete" | "get" | "put"> {
  return {
    delete: overrides.delete ?? (async () => undefined),
    get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
      if (pathOrUrl.startsWith("/me/drive/special/approot?")) {
        return schema.parse({
          id: "app-root",
          name: "Notes",
          parentReference: {
            driveId: "drive-1",
          },
        });
      }

      throw new Error(`Unexpected path: ${pathOrUrl}`);
    },
    put:
      overrides.put ??
      (async <T>(_pathOrUrl: string, schema: z.ZodType<T>) =>
        schema.parse(createDriveItemFixture({ id: "note-1" }))),
  };
}

function createDriveItemFixture(overrides: Partial<{ id: string }> = {}) {
  return {
    id: overrides.id ?? "note-1",
    name: "Note.md",
    file: {},
    lastModifiedDateTime: "2026-06-15T12:30:00.0000000Z",
  };
}

function createProjectRecord(overrides: Partial<LocalProjectRecord> = {}): LocalProjectRecord {
  return {
    id: "project-1",
    driveItemId: "project-1",
    name: "Project",
    path: "/Project",
    remoteUpdatedAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createNoteRecord(overrides: Partial<LocalNoteRecord> = {}): LocalNoteRecord {
  return {
    id: "note-local-1",
    driveItemId: "note-1",
    projectId: null,
    name: "Note.md",
    path: "/Note.md",
    type: "markdown",
    starred: false,
    content: "# Note\n",
    remoteUpdatedAt: now,
    updatedAt: now,
    ...overrides,
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

function createPendingNoteDeleteWrite(note: LocalNoteRecord): PendingNoteWrite {
  return {
    noteId: note.id,
    operation: "delete",
    driveItemId: note.driveItemId,
    note: null,
    updatedAt: note.updatedAt,
  };
}
