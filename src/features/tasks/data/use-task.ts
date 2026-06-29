import type { TaskRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

interface TaskState {
  task: TaskRecord | null;
  isLoading: boolean;
}

const initialState: TaskState = {
  task: null,
  isLoading: true,
};

/** Subscribes to one task record by id, returning null for missing or deleted rows. */
export function useTask(id: string): TaskState {
  const db = useDatabase();
  const [state, setState] = useState<TaskState>(initialState);

  useEffect(() => {
    setState(initialState);

    const subscription = liveQuery(async () => {
      const task = await db.tasks.get(id);
      return task && task.deletedAt === null ? task : null;
    }).subscribe({
      next: (task) => setState({ task, isLoading: false }),
      error: () => setState({ task: null, isLoading: false }),
    });

    return () => subscription.unsubscribe();
  }, [db, id]);

  return state;
}
