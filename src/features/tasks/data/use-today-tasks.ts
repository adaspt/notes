import { useLiveQuery } from "@/hooks/use-live-query";
import type { TaskRecord } from "@/data/schemas";
import { useCallback } from "react";
import { listPendingTasks } from "./task-queries";
import { isDeferred, isDueByToday } from "./task-filters";
import { byPriorityThenDueDate } from "./task-sort";
import { useTodayBoundary } from "./use-today-boundary";

function getTodayTasks(items: TaskRecord[], boundary: Date) {
  return items
    .filter((task) => !isDeferred(task) && isDueByToday(task, boundary))
    .toSorted(byPriorityThenDueDate);
}

export function useTodayTasks() {
  const boundary = useTodayBoundary();
  const transform = useCallback(
    (items: TaskRecord[]) => getTodayTasks(items, boundary),
    [boundary],
  );

  return useLiveQuery(listPendingTasks, transform);
}
