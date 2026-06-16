import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { localDatabase, type LocalNoteRecord } from "@/lib/local-data";

import {
  getInboxNoteListItems,
  getProjectNoteListItems,
  getStarredNoteListItems,
  type NoteListItem,
} from "./note-data";

type NoteListState = {
  items: NoteListItem[];
  isLoading: boolean;
};

const initialState: NoteListState = {
  items: [],
  isLoading: true,
};

export function useInboxNotes() {
  return useNoteList("inbox");
}

export function useStarredNotes() {
  return useNoteList("starred");
}

export function useProjectNotes(projectId: string) {
  return useNoteList("project", projectId);
}

function useNoteList(scope: "inbox" | "project" | "starred", projectId: string | null = null) {
  const [state, setState] = useState<NoteListState>(initialState);

  useEffect(() => {
    setState(initialState);

    const subscription = liveQuery(async () => localDatabase.notes.toArray()).subscribe({
      next: (notes: LocalNoteRecord[]) => {
        setState({
          items: getScopedNoteListItems(notes, scope, projectId),
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
  }, [projectId, scope]);

  return state;
}

function getScopedNoteListItems(
  notes: LocalNoteRecord[],
  scope: "inbox" | "project" | "starred",
  projectId: string | null,
): NoteListItem[] {
  if (scope === "inbox") {
    return getInboxNoteListItems(notes);
  }

  if (scope === "starred") {
    return getStarredNoteListItems(notes);
  }

  return projectId ? getProjectNoteListItems(notes, projectId) : [];
}
