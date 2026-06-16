import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { localDatabase, type LocalProjectRecord } from "@/lib/local-data";

type ProjectsState = {
  isLoading: boolean;
  projects: LocalProjectRecord[];
};

const initialState: ProjectsState = {
  isLoading: true,
  projects: [],
};

export function useProjects() {
  const [state, setState] = useState<ProjectsState>(initialState);

  useEffect(() => {
    const subscription = liveQuery(async () => localDatabase.projects.toArray()).subscribe({
      next: (projects: LocalProjectRecord[]) => {
        setState({
          isLoading: false,
          projects: projects.sort(compareProjects),
        });
      },
      error: () => {
        setState({
          isLoading: false,
          projects: [],
        });
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

export function useProject(projectId: string) {
  const [state, setState] = useState<{ isLoading: boolean; project: LocalProjectRecord | null }>({
    isLoading: true,
    project: null,
  });

  useEffect(() => {
    const subscription = liveQuery(async () => localDatabase.projects.get(projectId)).subscribe({
      next: (project) => {
        setState({
          isLoading: false,
          project: project ?? null,
        });
      },
      error: () => {
        setState({
          isLoading: false,
          project: null,
        });
      },
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return state;
}

function compareProjects(firstProject: LocalProjectRecord, secondProject: LocalProjectRecord) {
  return firstProject.path.localeCompare(secondProject.path);
}
