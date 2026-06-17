import type { LocalTaskRecord, NotesLocalDatabase, TaskStatus } from "@/lib/local-data";

import { readPagedGraphCollection, type GraphClient } from "./graph-client";
import { graphTodoTaskListSchema, graphTodoTaskSchema, type GraphTodoTask } from "./graph-schemas";

async function listTodoTaskLists(client: Pick<GraphClient, "get">) {
  return readPagedGraphCollection(client, "/me/todo/lists", graphTodoTaskListSchema);
}

export async function discoverDefaultTodoTaskList(client: Pick<GraphClient, "get">) {
  const taskLists = await listTodoTaskLists(client);
  const defaultTaskList =
    taskLists.find((taskList) => taskList.wellknownListName === "defaultList") ??
    taskLists.find((taskList) => taskList.displayName.toLowerCase() === "tasks") ??
    taskLists[0];

  if (!defaultTaskList) {
    throw new Error("No Microsoft To Do task lists were returned.");
  }

  return defaultTaskList;
}

export async function pushPendingTaskWrites(
  client: Pick<GraphClient, "patch" | "post">,
  taskListId: string,
  database: NotesLocalDatabase,
) {
  const pendingWrites = await database.pendingTaskWrites.orderBy("updatedAt").toArray();

  for (const pendingWrite of pendingWrites) {
    const pushedTask = await upsertTodoTask(client, taskListId, pendingWrite.task);

    await database.transaction("rw", database.tasks, database.pendingTaskWrites, async () => {
      const currentTask = await database.tasks.get(pendingWrite.taskId);
      if (!currentTask) {
        return;
      }

      const pushedRemoteUpdatedAt = normalizeGraphDateTime(pushedTask.lastModifiedDateTime);
      await database.tasks.put({
        ...currentTask,
        remoteId: pushedTask.id,
        remoteUpdatedAt: pushedRemoteUpdatedAt,
      });
      if (currentTask.updatedAt === pendingWrite.updatedAt) {
        await database.pendingTaskWrites.delete(pendingWrite.taskId);
        return;
      }

      const latestPendingWrite = await database.pendingTaskWrites.get(pendingWrite.taskId);
      if (latestPendingWrite && latestPendingWrite.task.remoteId === null) {
        await database.pendingTaskWrites.put({
          ...latestPendingWrite,
          task: {
            ...latestPendingWrite.task,
            remoteId: pushedTask.id,
            remoteUpdatedAt: pushedRemoteUpdatedAt,
          },
        });
      }
    });
  }
}

async function upsertTodoTask(
  client: Pick<GraphClient, "patch" | "post">,
  taskListId: string,
  task: LocalTaskRecord,
) {
  const body = toGraphTodoTaskPayload(task);

  if (task.remoteId) {
    return client.patch(
      `/me/todo/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(task.remoteId)}`,
      graphTodoTaskSchema,
      body,
    );
  }

  return client.post(
    `/me/todo/lists/${encodeURIComponent(taskListId)}/tasks`,
    graphTodoTaskSchema,
    body,
  );
}

export function normalizeTodoTask(
  task: GraphTodoTask,
  id: string,
  updatedAt = new Date().toISOString(),
): LocalTaskRecord {
  const remoteUpdatedAt = normalizeGraphDateTime(task.lastModifiedDateTime);

  return {
    id,
    remoteId: task.id,
    title: task.title?.trim() || "Untitled task",
    body: task.body?.content ?? "",
    dueDate: task.dueDateTime?.dateTime.slice(0, 10) ?? null,
    priority: task.importance ?? "normal",
    status: normalizeTaskStatus(task.status),
    remoteUpdatedAt,
    updatedAt,
  };
}

function toGraphTodoTaskPayload(task: LocalTaskRecord) {
  return {
    title: task.title,
    body: {
      content: task.body,
      contentType: "text",
    },
    dueDateTime: task.dueDate
      ? {
          dateTime: `${task.dueDate}T00:00:00.0000000`,
          timeZone: "UTC",
        }
      : null,
    importance: task.priority,
    status: task.status,
  };
}

function normalizeTaskStatus(status: GraphTodoTask["status"]): TaskStatus {
  if (status === "completed" || status === "deferred") {
    return status;
  }

  return "notStarted";
}

function normalizeGraphDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}
