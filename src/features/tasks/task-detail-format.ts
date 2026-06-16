import type { LocalTaskRecord, TaskStatus } from "@/lib/local-data";

import { formatTaskDueDate, formatTaskPriority, getLocalDateKey } from "./task-list-format";

export type TaskDetailViewModel = {
  title: string;
  dueDateLabel: string;
  notesBody: string | null;
  priorityLabel: string;
  statusLabel: string;
};

export function toTaskDetailViewModel(
  task: LocalTaskRecord,
  today = getLocalDateKey(),
): TaskDetailViewModel {
  return {
    title: task.title,
    dueDateLabel: formatTaskDueDate(task.dueDate, today),
    notesBody: task.body.trim() || null,
    priorityLabel: formatTaskPriority(task.priority),
    statusLabel: formatTaskStatus(task.status),
  };
}

export function formatTaskStatus(status: TaskStatus) {
  switch (status) {
    case "notStarted":
      return "Not started";
    case "completed":
      return "Completed";
    case "deferred":
      return "Deferred";
  }
}
