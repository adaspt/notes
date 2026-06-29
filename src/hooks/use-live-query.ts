import type { Database } from "@/data/database";
import { useDatabase } from "@/data/use-database";
import { liveQuery } from "dexie";
import { useEffect, useMemo, useState } from "react";

interface LiveQueryState<T> {
  items: T[];
  isLoading: boolean;
}

const initialState: LiveQueryState<unknown> = {
  items: [],
  isLoading: true,
};

/**
 * Subscribes to a Dexie live query and derives a view of the result via `transform`.
 *
 * The raw query result is held in state; the subscription only re-runs when `query`
 * or `db` change. `transform` is applied on render, so a transform whose identity
 * changes (e.g. one closing over a date boundary that rolls at midnight) re-derives
 * the view from the cached items without re-hitting the database.
 */
export function useLiveQuery<T>(
  query: (db: Database) => Promise<T[]>,
  transform: (items: T[]) => T[],
) {
  const db = useDatabase();
  const [state, setState] = useState<LiveQueryState<T>>(initialState as LiveQueryState<T>);

  useEffect(() => {
    const subscription = liveQuery(() => query(db)).subscribe({
      next: (items) => setState({ items, isLoading: false }),
      error: () => setState({ items: [], isLoading: false }),
    });

    return () => subscription.unsubscribe();
  }, [query, db]);

  return useMemo<LiveQueryState<T>>(
    () => ({ items: transform(state.items), isLoading: state.isLoading }),
    [state, transform],
  );
}
