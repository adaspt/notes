import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vite-plus/test";
import type { z } from "zod";

import {
  createLocalDatabase,
  defaultNoteDeltaCursorId,
  type LocalNoteRecord,
  type LocalProjectRecord,
  type PendingNoteWrite,
} from "@/lib/local-data";

import type { GraphClient } from "./graph-client";
import { syncNotesWithDelta } from "./note-delta-sync";

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
  const database = createLocalDatabase(`note-delta-test-${crypto.randomUUID()}`);
  databases.add(database);
  return database;
}

describe("syncNotesWithDelta", () => {
  it("loads app-root delta items, caches folders and note content, and stores the cursor", async () => {
    const database = createTestDatabase();
    const requests: string[] = [];
    const client: Pick<GraphClient, "get" | "getText"> = {
      get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        requests.push(pathOrUrl);
        return schema.parse(createInitialDeltaFixture(pathOrUrl));
      },
      getText: async (pathOrUrl: string) => createContentFixture(pathOrUrl),
    };

    const result = await syncNotesWithDelta(client, database, now);

    expect(requests).toEqual([
      "/me/drive/special/approot?$select=id,name,parentReference,lastModifiedDateTime",
      "/drives/drive-1/items/app-root/delta?$select=id,name,parentReference,lastModifiedDateTime,file,folder,deleted",
    ]);
    expect(result.projects.map((project) => project.path).sort()).toEqual([
      "/Project 1",
      "/Project 1/Area",
    ]);
    expect(result.notes.map((note) => note.path).sort()).toEqual([
      "/Inbox.md",
      "/Project 1/Area/Checklist.list.md",
    ]);
    await expect(
      database.notes.where("driveItemId").equals("nested-note").first(),
    ).resolves.toMatchObject({
      content: "- Keep delta recursive\n",
      projectId: "area-1",
      starred: true,
      type: "list",
    });
    await expect(database.noteDeltaCursors.get(defaultNoteDeltaCursorId)).resolves.toMatchObject({
      appRootDriveItemId: "app-root",
      deltaLink: "https://graph.test/notes-delta?token=1",
      driveId: "drive-1",
    });
  });

  it("uses the saved delta link and updates descendant paths when a folder is renamed", async () => {
    const database = createTestDatabase();
    await database.projects.put(
      createProjectRecord({
        id: "project-1",
        driveItemId: "project-1",
        name: "Project Old",
        path: "/Project Old",
      }),
    );
    await database.notes.put(
      createNoteRecord({
        driveItemId: "note-1",
        path: "/Project Old/Note.md",
        projectId: "project-1",
      }),
    );
    await database.noteDeltaCursors.put({
      id: defaultNoteDeltaCursorId,
      appRootDriveItemId: "app-root",
      driveId: "drive-1",
      deltaLink: "https://graph.test/notes-delta?token=1",
      updatedAt: now,
    });
    const requests: string[] = [];
    const client: Pick<GraphClient, "get" | "getText"> = {
      get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        requests.push(pathOrUrl);
        return schema.parse(createRenameDeltaFixture(pathOrUrl));
      },
      getText: async () => {
        throw new Error("Unexpected content request.");
      },
    };

    await syncNotesWithDelta(client, database, now);

    expect(requests).toEqual([
      "/me/drive/special/approot?$select=id,name,parentReference,lastModifiedDateTime",
      "https://graph.test/notes-delta?token=1",
    ]);
    await expect(database.projects.get("project-1")).resolves.toMatchObject({
      name: "Project New",
      path: "/Project New",
    });
    await expect(
      database.notes.where("driveItemId").equals("note-1").first(),
    ).resolves.toMatchObject({
      path: "/Project New/Note.md",
    });
  });

  it("keeps a locally changed note when it was deleted remotely", async () => {
    const database = createTestDatabase();
    const note = createNoteRecord({ driveItemId: "note-1" });
    await database.notes.put(note);
    await database.pendingNoteWrites.put(createPendingNoteWrite(note));
    const client: Pick<GraphClient, "get" | "getText"> = {
      get: async <T>(pathOrUrl: string, schema: z.ZodType<T>) => {
        return schema.parse(createDeleteDeltaFixture(pathOrUrl));
      },
      getText: async () => {
        throw new Error("Unexpected content request.");
      },
    };

    await syncNotesWithDelta(client, database, now);

    await expect(database.notes.get(note.id)).resolves.toMatchObject({
      content: note.content,
      driveItemId: "note-1",
    });
    await expect(database.noteDeltaCursors.get(defaultNoteDeltaCursorId)).resolves.toMatchObject({
      deltaLink: "https://graph.test/notes-delta?token=1",
    });
  });
});

function createInitialDeltaFixture(pathOrUrl: string) {
  if (pathOrUrl.startsWith("/me/drive/special/approot?")) {
    return createAppRootFixture();
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
          id: "area-1",
          name: "Area",
          folder: {},
          parentReference: {
            id: "project-1",
          },
          lastModifiedDateTime: "2026-06-15T10:45:00.0000000Z",
        },
        {
          id: "nested-note",
          name: "Checklist.list.md",
          file: {},
          parentReference: {
            id: "area-1",
          },
          lastModifiedDateTime: "2026-06-15T11:00:00.0000000Z",
        },
      ],
      "@odata.deltaLink": "https://graph.test/notes-delta?token=1",
    };
  }

  throw new Error(`Unexpected path: ${pathOrUrl}`);
}

function createRenameDeltaFixture(pathOrUrl: string) {
  if (pathOrUrl.startsWith("/me/drive/special/approot?")) {
    return createAppRootFixture();
  }

  if (pathOrUrl === "https://graph.test/notes-delta?token=1") {
    return {
      value: [
        {
          id: "project-1",
          name: "Project New",
          folder: {},
          parentReference: {
            id: "app-root",
          },
          lastModifiedDateTime: "2026-06-15T12:30:00.0000000Z",
        },
      ],
      "@odata.deltaLink": "https://graph.test/notes-delta?token=2",
    };
  }

  throw new Error(`Unexpected path: ${pathOrUrl}`);
}

function createDeleteDeltaFixture(pathOrUrl: string) {
  if (pathOrUrl.startsWith("/me/drive/special/approot?")) {
    return createAppRootFixture();
  }

  if (pathOrUrl.startsWith("/drives/drive-1/items/app-root/delta?")) {
    return {
      value: [
        {
          id: "note-1",
          deleted: {},
        },
      ],
      "@odata.deltaLink": "https://graph.test/notes-delta?token=1",
    };
  }

  throw new Error(`Unexpected path: ${pathOrUrl}`);
}

function createAppRootFixture() {
  return {
    id: "app-root",
    name: "Notes",
    parentReference: {
      driveId: "drive-1",
    },
  };
}

function createContentFixture(pathOrUrl: string) {
  if (pathOrUrl === "/me/drive/items/inbox-note/content") {
    return "# Inbox\n";
  }

  if (pathOrUrl === "/me/drive/items/nested-note/content") {
    return "---\ntype: list\nstarred: true\n---\n- Keep delta recursive\n";
  }

  throw new Error(`Unexpected content path: ${pathOrUrl}`);
}

function createProjectRecord(overrides: Partial<LocalProjectRecord> = {}): LocalProjectRecord {
  return {
    id: "project-1",
    driveItemId: "project-1",
    name: "Project 1",
    path: "/Project 1",
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
