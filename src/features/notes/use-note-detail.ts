import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

import { localDatabase, type LocalNoteRecord } from "@/lib/local-data";

import { toNoteDetail, type NoteDetail } from "./note-data";

type NoteDetailState = {
  detail: NoteDetail | null;
  isLoading: boolean;
};

const initialState: NoteDetailState = {
  detail: null,
  isLoading: true,
};

export function useNoteDetail(noteId: string) {
  const [state, setState] = useState<NoteDetailState>(initialState);

  useEffect(() => {
    setState(initialState);

    const subscription = liveQuery(async () => localDatabase.notes.get(noteId)).subscribe({
      next: (note: LocalNoteRecord | undefined) => {
        setState({
          detail: note ? toNoteDetail(note) : null,
          isLoading: false,
        });
      },
      error: () => {
        setState({
          detail: null,
          isLoading: false,
        });
      },
    });

    return () => subscription.unsubscribe();
  }, [noteId]);

  return state;
}
