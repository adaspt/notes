import type { Database } from "@/data/database";
import type { NoteRecord } from "@/data/schemas";
import { createId } from "@/lib/id";
import { isTitleAvailable, isValidTitle, normalizeTitle } from "./note-title";

export interface CreateNoteInput {
  title: string;
  projectId?: string | null;
  body?: string;
  starred?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
  starred?: boolean;
}

export async function createNote(db: Database, input: CreateNoteInput): Promise<NoteRecord> {
  const title = normalizeTitle(input.title);
  const projectId = input.projectId ?? null;

  await assertTitle(db, projectId, title);

  const note: NoteRecord = {
    id: createId(),
    remoteId: null,
    title,
    lastSyncedTitle: null,
    body: input.body ?? "",
    starred: input.starred ? 1 : 0,
    projectId,
    updatedAt: new Date(),
    syncStatus: "dirty",
    deletedAt: null,
  };

  await db.notes.add(note);
  return note;
}

export async function updateNote(
  db: Database,
  id: string,
  input: UpdateNoteInput,
): Promise<NoteRecord> {
  const existing = await db.notes.get(id);

  if (!existing || existing.deletedAt) {
    throw new Error(`Note not found: ${id}`);
  }

  const title = input.title === undefined ? existing.title : normalizeTitle(input.title);
  if (title !== existing.title) {
    await assertTitle(db, existing.projectId, title, id);
  }

  const updated: NoteRecord = {
    ...existing,
    title,
    body: input.body ?? existing.body,
    starred: input.starred === undefined ? existing.starred : input.starred ? 1 : 0,
    updatedAt: new Date(),
    syncStatus: "dirty",
  };

  await db.notes.put(updated);
  return updated;
}

export async function deleteNote(db: Database, id: string): Promise<NoteRecord> {
  const existing = await db.notes.get(id);

  if (!existing) {
    throw new Error(`Note not found: ${id}`);
  }

  if (existing.deletedAt) {
    return existing;
  }

  const deleted: NoteRecord = {
    ...existing,
    updatedAt: new Date(),
    syncStatus: "dirty",
    deletedAt: new Date(),
  };

  await db.notes.put(deleted);
  return deleted;
}

async function assertTitle(
  db: Database,
  projectId: string | null,
  title: string,
  excludeId?: string,
) {
  if (!isValidTitle(title)) {
    throw new Error('Note title cannot be empty or contain \\ / : * ? " < > |');
  }

  if (!(await isTitleAvailable(db, projectId, title, excludeId))) {
    throw new Error("A note with this title already exists here");
  }
}
