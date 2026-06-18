import Dexie, { type Table } from "dexie";

import type {
  LocalNoteRecord,
  NoteDeltaCursorRecord,
  LocalProjectRecord,
  LocalTaskRecord,
  PendingNoteWrite,
  PendingTaskWrite,
  TaskDeltaCursorRecord,
} from "./schemas";

const localDatabaseName = "notes-local";

export class NotesLocalDatabase extends Dexie {
  tasks!: Table<LocalTaskRecord, string>;
  notes!: Table<LocalNoteRecord, string>;
  projects!: Table<LocalProjectRecord, string>;
  pendingTaskWrites!: Table<PendingTaskWrite, string>;
  pendingNoteWrites!: Table<PendingNoteWrite, string>;
  taskDeltaCursors!: Table<TaskDeltaCursorRecord, string>;
  noteDeltaCursors!: Table<NoteDeltaCursorRecord, string>;

  constructor(name = localDatabaseName) {
    super(name);

    this.version(1).stores({
      tasks: "&id, remoteId, status, dueDate, priority, updatedAt",
      notes: "&id, driveItemId, projectId, path, type, starred, updatedAt",
      projects: "&id, driveItemId, name, path, updatedAt",
      pendingTaskWrites: "&taskId, operation, updatedAt",
      pendingNoteWrites: "&noteId, operation, updatedAt",
      taskDeltaCursors: "&id, listId, updatedAt",
      noteDeltaCursors: "&id, appRootDriveItemId, driveId, updatedAt",
    });
  }
}

export function createLocalDatabase(name?: string) {
  return new NotesLocalDatabase(name);
}

export const localDatabase = createLocalDatabase();
