import { useLiveQuery } from "@/hooks/use-live-query";
import { useCallback } from "react";
import { listInboxNotes } from "./note-queries";

export function useInboxNotes() {
  return useLiveQuery(
    listInboxNotes,
    useCallback((items) => items, []),
  );
}
