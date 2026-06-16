import {
  createUniqueTaskId,
  defaultTaskDeltaCursorId,
  type LocalTaskRecord,
  type NotesLocalDatabase,
} from "@/lib/local-data";

import { readPagedGraphCollectionWithDelta, type GraphClient } from "./graph-client";
import {
  graphTodoTaskDeltaItemSchema,
  type GraphTodoTask,
  type GraphTodoTaskDeltaItem,
} from "./graph-schemas";
import { normalizeTodoTask } from "./tasks";

export type TodoTaskDeltaSyncResult = {
  tasks: LocalTaskRecord[];
  changedRemoteItems: number;
  deltaLink: string;
};

export async function syncTodoTasksWithDelta(
  client: Pick<GraphClient, "get">,
  taskListId: string,
  database: NotesLocalDatabase,
  updatedAt = new Date().toISOString(),
): Promise<TodoTaskDeltaSyncResult> {
  const cursor = await database.taskDeltaCursors.get(defaultTaskDeltaCursorId);
  const pathOrUrl =
    cursor?.listId === taskListId && cursor.deltaLink
      ? cursor.deltaLink
      : `/me/todo/lists/${encodeURIComponent(taskListId)}/tasks/delta`;
  const { items, deltaLink } = await readPagedGraphCollectionWithDelta(
    client,
    pathOrUrl,
    graphTodoTaskDeltaItemSchema,
  );

  if (!deltaLink) {
    throw new Error("Microsoft Graph did not return a task delta link.");
  }

  await database.transaction(
    "rw",
    database.tasks,
    database.pendingTaskWrites,
    database.taskDeltaCursors,
    async () => {
      for (const item of items) {
        if (item["@removed"]) {
          await applyRemoteTaskDelete(database, item);
          continue;
        }

        await applyRemoteTaskUpsert(database, item, updatedAt);
      }

      await database.taskDeltaCursors.put({
        id: defaultTaskDeltaCursorId,
        listId: taskListId,
        deltaLink,
        updatedAt,
      });
    },
  );

  return {
    tasks: await database.tasks.toArray(),
    changedRemoteItems: items.length,
    deltaLink,
  };
}

async function applyRemoteTaskUpsert(
  database: NotesLocalDatabase,
  task: GraphTodoTask,
  updatedAt: string,
) {
  const existingTask = await database.tasks.where("remoteId").equals(task.id).first();
  if (existingTask && (await database.pendingTaskWrites.get(existingTask.id))) {
    return;
  }

  const taskId = existingTask?.id ?? (await createUniqueTaskId(database));
  await database.tasks.put(normalizeTodoTask(task, taskId, updatedAt));
}

async function applyRemoteTaskDelete(
  database: NotesLocalDatabase,
  task: Pick<GraphTodoTaskDeltaItem, "id">,
) {
  const existingTask = await database.tasks.where("remoteId").equals(task.id).first();
  if (!existingTask) {
    return;
  }

  if (await database.pendingTaskWrites.get(existingTask.id)) {
    throw new Error("A locally changed task was deleted in Microsoft To Do before sync completed.");
  }

  await database.tasks.delete(existingTask.id);
}
