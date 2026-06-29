import type { TaskRecord } from "@/data/schemas";

/** Latest instant of the current local day. */
export function endOfToday(now = new Date()): Date {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** First instant of the next local day, guaranteed strictly after today. */
export function startOfTomorrow(now = new Date()): Date {
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

export const isDeferred = (task: TaskRecord) => task.status === "deferred";

/** Due today or earlier, or undated. */
export const isDueByToday = (task: TaskRecord, boundary: Date) =>
  task.dueDate === null || task.dueDate <= boundary;

/** Has a due date strictly after today. */
export const isDueAfterToday = (task: TaskRecord, boundary: Date) =>
  task.dueDate !== null && task.dueDate > boundary;
