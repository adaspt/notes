import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { localDatabase, type LocalTaskRecord } from "@/lib/local-data";

import { getBacklogTaskListItems, type TaskListItem } from "./task-list-format";

type BacklogTasksState = {
  items: TaskListItem[];
  isLoading: boolean;
};

const initialState: BacklogTasksState = {
  items: [],
  isLoading: true,
};

export function useBacklogTasks() {
  const [state, setState] = useState<BacklogTasksState>(initialState);

  useEffect(() => {
    const subscription = liveQuery(async () => localDatabase.tasks.toArray()).subscribe({
      next: (tasks: LocalTaskRecord[]) => {
        setState({
          items: getBacklogTaskListItems(tasks),
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
