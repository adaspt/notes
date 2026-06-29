import type { ProjectRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

interface ProjectState {
  project: ProjectRecord | null;
  isLoading: boolean;
}

const initialState: ProjectState = {
  project: null,
  isLoading: true,
};

export function useProject(id: string): ProjectState {
  const db = useDatabase();
  const [state, setState] = useState<ProjectState>(initialState);

  useEffect(() => {
    setState(initialState);

    const subscription = liveQuery(() => db.projects.get(id)).subscribe({
      next: (project) => setState({ project: project ?? null, isLoading: false }),
      error: () => setState({ project: null, isLoading: false }),
    });

    return () => subscription.unsubscribe();
  }, [db, id]);

  return state;
}
