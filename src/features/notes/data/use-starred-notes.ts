import { useLiveQuery } from "@/hooks/use-live-query";
import { useCallback } from "react";
import { listStarredNotes } from "./note-queries";

export function useStarredNotes() {
  return useLiveQuery(
    listStarredNotes,
    useCallback((items) => items, []),
  );
}
