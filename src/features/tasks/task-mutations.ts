import {
  createSyncStateRecord,
  createUniqueTaskId,
  localDatabase,
  type LocalTaskRecord,
  type NotesLocalDatabase,
} from "@/lib/local-data";

import { getLocalDateKey } from "./task-list-format";

type TaskMutationOptions = {
  database?: NotesLocalDatabase;
  now?: Date;
};

export type TaskEditValues = Pick<
  LocalTaskRecord,
  "body" | "dueDate" | "priority" | "status" | "title"
>;

export type TaskCreateValues = Pick<LocalTaskRecord, "title"> &
  Partial<Pick<LocalTaskRecord, "body" | "dueDate" | "priority" | "status">>;

type TaskMutationPatch = Partial<TaskEditValues>;

export async function createTask(values: TaskCreateValues, options: TaskMutationOptions = {}) {
  const database = options.database ?? localDatabase;
  const now = options.now ?? new Date();
  const updatedAt = now.toISOString();
  const taskId = await createUniqueTaskId(database);
  const title = values.title.trim();

  if (!title) {
    throw new Error("Task title is required.");
  }

  return database.transaction(
    "rw",
    database.tasks,
    database.pendingTaskWrites,
    database.syncStates,
    async () => {
      const task: LocalTaskRecord = {
        id: taskId,
        remoteId: null,
        title,
        body: values.body ?? "",
        dueDate: values.dueDate ?? null,
        priority: values.priority ?? "normal",
        status: values.status ?? "notStarted",
        remoteUpdatedAt: null,
        updatedAt,
      };

      await database.tasks.put(task);
      await database.pendingTaskWrites.put({
        taskId,
        operation: "upsert",
        task,
        updatedAt,
      });

      const existingSyncState = await database.syncStates.get("global");
      await database.syncStates.put(
        createSyncStateRecord("offlineChanges", updatedAt, {
          lastSyncedAt: existingSyncState?.lastSyncedAt ?? null,
        }),
      );

      return task;
    },
  );
}

export async function completeTask(taskId: string, options: TaskMutationOptions = {}) {
  return updateTask(taskId, () => ({ status: "completed" }), options);
}

export async function moveTaskToToday(taskId: string, options: TaskMutationOptions = {}) {
  return updateTask(
    taskId,
    (now) => ({
      dueDate: getLocalDateKey(now),
      status: "notStarted",
    }),
    options,
  );
}

export async function moveTaskToTomorrow(taskId: string, options: TaskMutationOptions = {}) {
  return updateTask(
    taskId,
    (now) => ({
      dueDate: getTomorrowDateKey(now),
      status: "notStarted",
    }),
    options,
  );
}

export async function moveTaskToNextWeek(taskId: string, options: TaskMutationOptions = {}) {
  return updateTask(
    taskId,
    (now) => ({
      dueDate: getNextMondayDateKey(now),
      status: "notStarted",
    }),
    options,
  );
}

export async function moveTaskToNextMonth(taskId: string, options: TaskMutationOptions = {}) {
  return updateTask(
    taskId,
    (now) => ({
      dueDate: getNextMonthFirstDateKey(now),
      status: "notStarted",
    }),
    options,
  );
}

export async function deferTaskToBacklog(taskId: string, options: TaskMutationOptions = {}) {
  return updateTask(taskId, () => ({ status: "deferred" }), options);
}

export async function editTask(
  taskId: string,
  values: TaskEditValues,
  options: TaskMutationOptions = {},
) {
  return updateTask(taskId, () => values, options);
}

export function getTomorrowDateKey(date = new Date()) {
  return getShiftedDateKey(date, 1);
}

export function getNextMondayDateKey(date = new Date()) {
  const dayOfWeek = date.getDay();
  const daysUntilNextMonday = (8 - dayOfWeek) % 7 || 7;
  return getShiftedDateKey(date, daysUntilNextMonday);
}

export function getNextMonthFirstDateKey(date = new Date()) {
  return getLocalDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 1));
}

async function updateTask(
  taskId: string,
  createPatch: (now: Date) => Partial<TaskMutationPatch>,
  options: TaskMutationOptions,
) {
  const database = options.database ?? localDatabase;
  const now = options.now ?? new Date();
  const updatedAt = now.toISOString();

  return database.transaction(
    "rw",
    database.tasks,
    database.pendingTaskWrites,
    database.syncStates,
    async () => {
      const task = await database.tasks.get(taskId);
      if (!task) {
        throw new Error("Task not found.");
      }

      const updatedTask: LocalTaskRecord = {
        ...task,
        ...createPatch(now),
        updatedAt,
      };

      await database.tasks.put(updatedTask);
      await database.pendingTaskWrites.put({
        taskId,
        operation: "upsert",
        task: updatedTask,
        updatedAt,
      });

      const existingSyncState = await database.syncStates.get("global");
      await database.syncStates.put(
        createSyncStateRecord("offlineChanges", updatedAt, {
          lastSyncedAt: existingSyncState?.lastSyncedAt ?? null,
        }),
      );

      return updatedTask;
    },
  );
}

function getShiftedDateKey(date: Date, days: number) {
  return getLocalDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
}
