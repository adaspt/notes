import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { localDatabase, type LocalTaskRecord } from "@/lib/local-data";

import { getLaterTaskListItems, type TaskListItem } from "./task-list-format";

type LaterTasksState = {
  items: TaskListItem[];
  isLoading: boolean;
};

const initialState: LaterTasksState = {
  items: [],
  isLoading: true,
};

export function useLaterTasks() {
  const [state, setState] = useState<LaterTasksState>(initialState);

  useEffect(() => {
    const subscription = liveQuery(async () => localDatabase.tasks.toArray()).subscribe({
      next: (tasks: LocalTaskRecord[]) => {
        setState({
          items: getLaterTaskListItems(tasks),
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
