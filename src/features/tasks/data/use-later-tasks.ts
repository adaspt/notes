import { useLiveQuery } from "@/hooks/use-live-query";
import type { TaskRecord } from "@/data/schemas";
import { useCallback } from "react";
import { listPendingTasks } from "./task-queries";
import { isDeferred, isDueAfterToday } from "./task-filters";
import { byDueDateThenPriority } from "./task-sort";
import { useTodayBoundary } from "./use-today-boundary";

function getLaterTasks(items: TaskRecord[], boundary: Date) {
  return items
    .filter((task) => !isDeferred(task) && isDueAfterToday(task, boundary))
    .toSorted(byDueDateThenPriority);
}

export function useLaterTasks() {
  const boundary = useTodayBoundary();
  const transform = useCallback(
    (items: TaskRecord[]) => getLaterTasks(items, boundary),
    [boundary],
  );

  return useLiveQuery(listPendingTasks, transform);
}
