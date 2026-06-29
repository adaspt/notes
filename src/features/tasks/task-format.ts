import type { Recurrence, TaskPriority, TaskStatus } from "@/data/schemas";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "High",
  normal: "Normal",
  low: "Low",
};

export function formatPriority(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority];
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  notStarted: "Not started",
  inProgress: "In progress",
  completed: "Completed",
  waitingOnOthers: "Waiting",
  deferred: "Deferred",
};

export function formatStatus(status: TaskStatus): string {
  return STATUS_LABELS[status];
}

const dueDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Weekday + numeric date, e.g. "Mon 01/01/2026", or null when unset. */
export function formatDueDate(dueDate: Date | null): string | null {
  if (!dueDate) return null;
  return dueDateFormatter.format(dueDate);
}

const reminderFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatReminder(reminder: Date | null): string | null {
  if (!reminder) return null;
  return reminderFormatter.format(reminder);
}

export function formatRecurrence(recurrence: Recurrence | null): string | null {
  if (!recurrence) return null;

  const { pattern } = recurrence;
  if (pattern.type === "daily")
    return pattern.interval === 1 ? "Daily" : `Every ${pattern.interval} days`;
  if (pattern.type === "weekly" && isWeekdays(pattern.daysOfWeek)) return "Weekdays";
  if (pattern.type === "weekly") {
    return pattern.interval === 1 ? "Weekly" : `Every ${pattern.interval} weeks`;
  }
  if (pattern.type === "absoluteMonthly") return "Monthly";
  if (pattern.type === "absoluteYearly") return "Yearly";
  return "Repeats";
}

const isWeekdays = (days: string[] | undefined) =>
  days?.length === 5 &&
  ["monday", "tuesday", "wednesday", "thursday", "friday"].every((day) => days.includes(day));
