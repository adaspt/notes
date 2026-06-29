import { useLiveQuery } from "@/hooks/use-live-query";
import type { TaskRecord } from "@/data/schemas";
import { listPendingTasks } from "./task-queries";
import { isDeferred } from "./task-filters";
import { byPriorityThenDueDate } from "./task-sort";

function getBacklogTasks(items: TaskRecord[]) {
  return items.filter(isDeferred).toSorted(byPriorityThenDueDate);
}

export function useBacklogTasks() {
  return useLiveQuery(listPendingTasks, getBacklogTasks);
}
