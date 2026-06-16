import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { localDatabase, type LocalTaskRecord } from "@/lib/local-data";

import { getTodayTaskListItems, type TaskListItem } from "./task-list-format";

type TodayTasksState = {
  items: TaskListItem[];
  isLoading: boolean;
};

const initialState: TodayTasksState = {
  items: [],
  isLoading: true,
};

export function useTodayTasks() {
  const [state, setState] = useState<TodayTasksState>(initialState);

  useEffect(() => {
    const subscription = liveQuery(async () => localDatabase.tasks.toArray()).subscribe({
      next: (tasks: LocalTaskRecord[]) => {
        setState({
          items: getTodayTaskListItems(tasks),
          isLoading: false,
        });
      },
      error: () => {
        setState({
          items: [],
          isLoading: false,
        });
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
