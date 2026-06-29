import { useLiveQuery } from "@/hooks/use-live-query";
import { useCallback } from "react";
import { listProjects } from "./note-queries";

export function useProjects() {
  return useLiveQuery(
    listProjects,
    useCallback((items) => items, []),
  );
}
