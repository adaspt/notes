import {
  localDatabase,
  type LocalNoteRecord,
  type LocalProjectRecord,
  type LocalTaskRecord,
  type NotesLocalDatabase,
} from "@/lib/local-data";

import { type GraphClient } from "./graph-client";
import type { GraphTodoTaskList } from "./graph-schemas";
import { syncNotesWithDelta } from "./note-delta-sync";
import { pushPendingNoteWrites } from "./notes";
import { syncTodoTasksWithDelta } from "./task-delta-sync";
import { discoverDefaultTodoTaskList, pushPendingTaskWrites } from "./tasks";

type InitialMicrosoftLoadResult = {
  defaultTaskList: GraphTodoTaskList;
  tasks: LocalTaskRecord[];
  projects: LocalProjectRecord[];
  notes: LocalNoteRecord[];
};

export async function loadInitialMicrosoftData(
  client: Pick<GraphClient, "delete" | "get" | "getText" | "patch" | "post" | "put">,
  database: NotesLocalDatabase = localDatabase,
) {
  const updatedAt = new Date().toISOString();
  const defaultTaskList = await discoverDefaultTodoTaskList(client);
  await pushPendingTaskWrites(client, defaultTaskList.id, database);
  await pushPendingNoteWrites(client, database);
  const [taskSyncResult, noteSyncResult] = await Promise.all([
    syncTodoTasksWithDelta(client, defaultTaskList.id, database, updatedAt),
    syncNotesWithDelta(client, database, updatedAt),
  ]);

  return {
    defaultTaskList,
    tasks: taskSyncResult.tasks,
    projects: noteSyncResult.projects,
    notes: noteSyncResult.notes,
  } satisfies InitialMicrosoftLoadResult;
}
