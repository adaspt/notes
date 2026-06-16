import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vite-plus/test";

import {
  createLocalDatabase,
  createSyncStateRecord,
  type LocalNoteRecord,
  type LocalProjectRecord,
} from "@/lib/local-data";

import { createNote, deleteNote, editNoteContent, setNoteStarred } from "./note-mutations";

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
  const database = createLocalDatabase(`note-mutations-test-${crypto.randomUUID()}`);
  databases.add(database);
  return database;
}

function createNoteRecord(overrides: Partial<LocalNoteRecord> = {}): LocalNoteRecord {
  return {
    id: "note-1",
    driveItemId: "note-1",
    projectId: null,
    name: "Note.md",
    path: "/Note.md",
    type: "markdown",
    starred: false,
    content: "# Note\n",
    remoteUpdatedAt: "2026-06-15T10:00:00.000Z",
    updatedAt: "2026-06-15T10:00:00.000Z",
    ...overrides,
  };
}

function createProjectRecord(overrides: Partial<LocalProjectRecord> = {}): LocalProjectRecord {
  return {
    id: "project-1",
    driveItemId: "project-1",
    name: "Project",
    path: "/Project",
    remoteUpdatedAt: "2026-06-15T10:00:00.000Z",
    updatedAt: "2026-06-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("note mutations", () => {
  it("creates an inbox markdown note and queues it for sync", async () => {
    const database = createTestDatabase();
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    const note = await createNote({ name: "Inbox note" }, { database, now });

    expect(note).toMatchObject({
      driveItemId: null,
      projectId: null,
      name: "Inbox note.md",
      path: "/Inbox note.md",
      type: "markdown",
      starred: false,
      content: "",
      remoteUpdatedAt: null,
      updatedAt: nowIso,
    });
    await expect(database.notes.get(note.id)).resolves.toEqual(note);
    await expect(database.pendingNoteWrites.get(note.id)).resolves.toMatchObject({
      operation: "upsert",
      note,
      updatedAt: nowIso,
    });
    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "offlineChanges",
    });
  });

  it("creates a project markdown note under the project path", async () => {
    const database = createTestDatabase();
    await database.projects.put(createProjectRecord());

    const note = await createNote(
      { name: "Project note", projectId: "project-1" },
      { database, now },
    );

    expect(note).toMatchObject({
      projectId: "project-1",
      name: "Project note.md",
      path: "/Project/Project note.md",
    });
    await expect(database.pendingNoteWrites.get(note.id)).resolves.toMatchObject({
      operation: "upsert",
      note: {
        driveItemId: null,
        path: "/Project/Project note.md",
      },
    });
  });

  it("rejects names with extensions or invalid path characters", async () => {
    const database = createTestDatabase();

    await expect(createNote({ name: "Already.md" }, { database, now })).rejects.toThrow(
      "Enter the note name without an extension.",
    );
    await expect(createNote({ name: "Bad/Name" }, { database, now })).rejects.toThrow(
      "Note name contains characters OneDrive cannot use.",
    );
    await expect(database.pendingNoteWrites.count()).resolves.toBe(0);
  });

  it("rejects duplicate note paths", async () => {
    const database = createTestDatabase();
    await database.notes.put(createNoteRecord({ name: "Existing.md", path: "/Existing.md" }));

    await expect(createNote({ name: "Existing" }, { database, now })).rejects.toThrow(
      "A note with that name already exists.",
    );
    await expect(database.pendingNoteWrites.count()).resolves.toBe(0);
  });

  it("rejects missing projects", async () => {
    const database = createTestDatabase();

    await expect(
      createNote({ name: "Project note", projectId: "missing-project" }, { database, now }),
    ).rejects.toThrow("Project not found.");
    await expect(database.pendingNoteWrites.count()).resolves.toBe(0);
  });

  it("edits note content and queues the latest note for sync", async () => {
    const database = createTestDatabase();
    await database.notes.put(createNoteRecord());
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    await editNoteContent("note-1", "# Updated\n\nBody text.", { database, now });

    await expect(database.notes.get("note-1")).resolves.toMatchObject({
      content: "# Updated\n\nBody text.",
      updatedAt: nowIso,
    });
    await expect(database.pendingNoteWrites.get("note-1")).resolves.toMatchObject({
      operation: "upsert",
      note: {
        id: "note-1",
        content: "# Updated\n\nBody text.",
      },
      updatedAt: nowIso,
    });
    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "offlineChanges",
    });
  });

  it("rejects missing notes without queueing a write", async () => {
    const database = createTestDatabase();

    await expect(editNoteContent("missing-note", "Updated", { database, now })).rejects.toThrow(
      "Note not found.",
    );
    await expect(database.pendingNoteWrites.count()).resolves.toBe(0);
  });

  it("updates note starred state and queues the latest note for sync", async () => {
    const database = createTestDatabase();
    await database.notes.put(createNoteRecord());
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    await setNoteStarred("note-1", true, { database, now });

    await expect(database.notes.get("note-1")).resolves.toMatchObject({
      starred: true,
      updatedAt: nowIso,
    });
    await expect(database.pendingNoteWrites.get("note-1")).resolves.toMatchObject({
      operation: "upsert",
      note: {
        id: "note-1",
        starred: true,
      },
      updatedAt: nowIso,
    });
    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "offlineChanges",
    });
  });

  it("rejects missing note starred updates without queueing a write", async () => {
    const database = createTestDatabase();

    await expect(setNoteStarred("missing-note", true, { database, now })).rejects.toThrow(
      "Note not found.",
    );
    await expect(database.pendingNoteWrites.count()).resolves.toBe(0);
  });

  it("deletes a note locally and queues its drive item for sync", async () => {
    const database = createTestDatabase();
    await database.notes.put(createNoteRecord());
    await database.syncStates.put(
      createSyncStateRecord("synced", "2026-06-15T10:00:00.000Z", {
        lastSyncedAt: "2026-06-15T10:00:00.000Z",
      }),
    );

    await deleteNote("note-1", { database, now });

    await expect(database.notes.get("note-1")).resolves.toBeUndefined();
    await expect(database.pendingNoteWrites.get("note-1")).resolves.toEqual({
      noteId: "note-1",
      operation: "delete",
      driveItemId: "note-1",
      note: null,
      updatedAt: nowIso,
    });
    await expect(database.syncStates.get("global")).resolves.toMatchObject({
      lastSyncedAt: "2026-06-15T10:00:00.000Z",
      status: "offlineChanges",
    });
  });

  it("queues a local-only note delete without a drive item", async () => {
    const database = createTestDatabase();
    await database.notes.put(createNoteRecord({ driveItemId: null }));

    await deleteNote("note-1", { database, now });

    await expect(database.notes.get("note-1")).resolves.toBeUndefined();
    await expect(database.pendingNoteWrites.get("note-1")).resolves.toMatchObject({
      operation: "delete",
      driveItemId: null,
      note: null,
      updatedAt: nowIso,
    });
  });

  it("rejects missing note deletes without queueing a write", async () => {
    const database = createTestDatabase();

    await expect(deleteNote("missing-note", { database, now })).rejects.toThrow("Note not found.");
    await expect(database.pendingNoteWrites.count()).resolves.toBe(0);
  });
});
