import type { TaskPriority, TaskRecord } from "@/data/schemas";

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

/** Undated tasks sort after dated ones. */
const dueDateValue = (task: TaskRecord) => task.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;

const byPriority = (a: TaskRecord, b: TaskRecord) =>
  PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];

const byDueDate = (a: TaskRecord, b: TaskRecord) => dueDateValue(a) - dueDateValue(b);

export const byPriorityThenDueDate = (a: TaskRecord, b: TaskRecord) =>
  byPriority(a, b) || byDueDate(a, b);

export const byDueDateThenPriority = (a: TaskRecord, b: TaskRecord) =>
  byDueDate(a, b) || byPriority(a, b);
