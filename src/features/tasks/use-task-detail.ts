import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { localDatabase, type LocalTaskRecord } from "@/lib/local-data";

type TaskDetailState = {
  isLoading: boolean;
  task: LocalTaskRecord | null;
};

const initialState: TaskDetailState = {
  isLoading: true,
  task: null,
};

export function useTaskDetail(taskId: string) {
  const [state, setState] = useState<TaskDetailState>(initialState);

  useEffect(() => {
    setState(initialState);

    const subscription = liveQuery(async () => localDatabase.tasks.get(taskId)).subscribe({
      next: (task) => {
        setState({
          isLoading: false,
          task: task ?? null,
        });
      },
      error: () => {
        setState({
          isLoading: false,
          task: null,
        });
      },
    });

    return () => subscription.unsubscribe();
  }, [taskId]);

  return state;
}
