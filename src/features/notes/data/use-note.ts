import type { NoteRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

interface NoteState {
  note: NoteRecord | null;
  isLoading: boolean;
}

const initialState: NoteState = {
  note: null,
  isLoading: true,
};

export function useNote(id: string): NoteState {
  const db = useDatabase();
  const [state, setState] = useState<NoteState>(initialState);

  useEffect(() => {
    setState(initialState);

    const subscription = liveQuery(async () => {
      const note = await db.notes.get(id);
      return note && note.deletedAt === null ? note : null;
    }).subscribe({
      next: (note) => setState({ note, isLoading: false }),
      error: () => setState({ note: null, isLoading: false }),
    });

    return () => subscription.unsubscribe();
  }, [db, id]);

  return state;
}
