import { useLiveQuery } from "@/hooks/use-live-query";
import { useCallback } from "react";
import { listProjectNotes } from "./note-queries";

export function useProjectNotes(projectId: string) {
  return useLiveQuery(
    useCallback((db) => listProjectNotes(db, projectId), [projectId]),
    useCallback((items) => items, []),
  );
}
