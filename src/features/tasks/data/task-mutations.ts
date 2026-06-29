import type { Database } from "@/data/database";
import type { Recurrence, TaskPriority, TaskRecord, TaskStatus } from "@/data/schemas";
import { createId } from "@/lib/id";

export interface CreateTaskInput {
  title: string;
  body?: string;
  dueDate?: Date | null;
  reminder?: Date | null;
  recurrence?: Recurrence | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export type UpdateTaskInput = Partial<
  Pick<TaskRecord, "title" | "body" | "dueDate" | "reminder" | "recurrence" | "priority" | "status">
>;

export async function createTask(db: Database, input: CreateTaskInput): Promise<TaskRecord> {
  const task: TaskRecord = {
    id: createId(),
    title: input.title,
    body: input.body ?? "",
    dueDate: input.dueDate ?? null,
    reminder: input.reminder ?? null,
    recurrence: input.recurrence ?? null,
    priority: input.priority ?? "normal",
    status: input.status ?? "notStarted",
    remoteId: null,
    updatedAt: new Date(),
    syncStatus: "dirty",
    deletedAt: null,
  };

  await db.tasks.add(task);
  return task;
}

export async function updateTask(
  db: Database,
  id: string,
  input: UpdateTaskInput,
): Promise<TaskRecord> {
  const existing = await db.tasks.get(id);

  if (!existing || existing.deletedAt) {
    throw new Error(`Task not found: ${id}`);
  }

  const updated: TaskRecord = {
    ...existing,
    ...input,
    updatedAt: new Date(),
    syncStatus: "dirty",
  };

  await db.tasks.put(updated);
  return updated;
}

export async function deleteTask(db: Database, id: string): Promise<TaskRecord> {
  const existing = await db.tasks.get(id);

  if (!existing) {
    throw new Error(`Task not found: ${id}`);
  }

  if (existing.deletedAt) {
    return existing;
  }

  const deleted: TaskRecord = {
    ...existing,
    updatedAt: new Date(),
    syncStatus: "dirty",
    deletedAt: new Date(),
  };

  await db.tasks.put(deleted);
  return deleted;
}
