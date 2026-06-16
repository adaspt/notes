import type { LocalTaskRecord, TaskPriority } from "@/lib/local-data";

export type TaskListItem = {
  id: string;
  title: string;
  dueDateLabel: string;
  priorityLabel: string;
};

const priorityRank: Record<TaskPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

export function getTodayTaskListItems(
  tasks: ReadonlyArray<LocalTaskRecord>,
  today = getLocalDateKey(),
) {
  return tasks
    .filter((task) => isTodayTask(task, today))
    .sort(compareTodayTasks)
    .map(toTaskListItem(today));
}

export function getLaterTaskListItems(
  tasks: ReadonlyArray<LocalTaskRecord>,
  today = getLocalDateKey(),
) {
  return tasks
    .filter((task) => isLaterTask(task, today))
    .sort(compareLaterTasks)
    .map(toTaskListItem(today));
}

export function getBacklogTaskListItems(
  tasks: ReadonlyArray<LocalTaskRecord>,
  today = getLocalDateKey(),
) {
  return tasks.filter(isBacklogTask).sort(compareBacklogTasks).map(toTaskListItem(today));
}

export function isTodayTask(task: LocalTaskRecord, today = getLocalDateKey()) {
  return task.status === "notStarted" && (task.dueDate === null || task.dueDate <= today);
}

export function isLaterTask(task: LocalTaskRecord, today = getLocalDateKey()) {
  return task.status === "notStarted" && task.dueDate !== null && task.dueDate > today;
}

export function isBacklogTask(task: LocalTaskRecord) {
  return task.status === "deferred";
}

export function compareTodayTasks(firstTask: LocalTaskRecord, secondTask: LocalTaskRecord) {
  const priorityComparison = priorityRank[firstTask.priority] - priorityRank[secondTask.priority];
  if (priorityComparison !== 0) {
    return priorityComparison;
  }

  const dueDateComparison = compareTodayDueDates(firstTask.dueDate, secondTask.dueDate);
  if (dueDateComparison !== 0) {
    return dueDateComparison;
  }

  return compareStableTaskIdentity(firstTask, secondTask);
}

export function compareLaterTasks(firstTask: LocalTaskRecord, secondTask: LocalTaskRecord) {
  const dueDateComparison = compareRequiredDueDates(firstTask.dueDate, secondTask.dueDate);
  if (dueDateComparison !== 0) {
    return dueDateComparison;
  }

  const priorityComparison = priorityRank[firstTask.priority] - priorityRank[secondTask.priority];
  if (priorityComparison !== 0) {
    return priorityComparison;
  }

  return compareStableTaskIdentity(firstTask, secondTask);
}

export function compareBacklogTasks(firstTask: LocalTaskRecord, secondTask: LocalTaskRecord) {
  const priorityComparison = priorityRank[firstTask.priority] - priorityRank[secondTask.priority];
  if (priorityComparison !== 0) {
    return priorityComparison;
  }

  const dueDateComparison = compareTodayDueDates(firstTask.dueDate, secondTask.dueDate);
  if (dueDateComparison !== 0) {
    return dueDateComparison;
  }

  return compareStableTaskIdentity(firstTask, secondTask);
}

export function toTaskListItem(today = getLocalDateKey()) {
  return (task: LocalTaskRecord): TaskListItem => ({
    id: task.id,
    title: task.title,
    dueDateLabel: formatTaskDueDate(task.dueDate, today),
    priorityLabel: formatTaskPriority(task.priority),
  });
}

export function formatTaskPriority(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "High priority";
    case "normal":
      return "Normal priority";
    case "low":
      return "Low priority";
  }
}

export function formatTaskDueDate(dueDate: string | null, today = getLocalDateKey()) {
  if (dueDate === null) {
    return "No due date";
  }

  if (dueDate === today) {
    return "Due today";
  }

  if (dueDate < today) {
    return `Overdue ${formatMonthDay(dueDate)}`;
  }

  return `Due ${formatMonthDay(dueDate)}`;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function compareTodayDueDates(firstDueDate: string | null, secondDueDate: string | null) {
  if (firstDueDate === secondDueDate) {
    return 0;
  }

  if (firstDueDate === null) {
    return 1;
  }

  if (secondDueDate === null) {
    return -1;
  }

  return firstDueDate.localeCompare(secondDueDate);
}

function compareRequiredDueDates(firstDueDate: string | null, secondDueDate: string | null) {
  if (firstDueDate === secondDueDate) {
    return 0;
  }

  if (firstDueDate === null) {
    return 1;
  }

  if (secondDueDate === null) {
    return -1;
  }

  return firstDueDate.localeCompare(secondDueDate);
}

function compareStableTaskIdentity(firstTask: LocalTaskRecord, secondTask: LocalTaskRecord) {
  const titleComparison = firstTask.title.localeCompare(secondTask.title);
  if (titleComparison !== 0) {
    return titleComparison;
  }

  return firstTask.id.localeCompare(secondTask.id);
}

function formatMonthDay(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${month}/${day}`;
}
