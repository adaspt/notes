import Dexie, { type Table } from "dexie";
import type { NoteRecord, ProjectRecord, SyncState, TaskRecord } from "./schemas";

export class Database extends Dexie {
  constructor() {
    super("notes");

    this.version(1).stores({
      tasks: "&id, &remoteId, syncStatus, status",
      syncState: "&scope",
      notes: "&id, &remoteId, syncStatus, projectId, starred",
      projects: "&id, &remoteId, name",
    });
  }

  tasks!: Table<TaskRecord, string>;
  notes!: Table<NoteRecord, string>;
  projects!: Table<ProjectRecord, string>;
  syncState!: Table<SyncState, string>;
}
