import type { Database } from "@/data/database";
import { useDatabase } from "@/data/use-database";
import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

const countPendingChanges = async (db: Database) => {
  const [notes, tasks] = await Promise.all([
    db.notes.where("syncStatus").equals("dirty").count(),
    db.tasks.where("syncStatus").equals("dirty").count(),
  ]);
  return notes + tasks;
};

/** Live count of locally-modified records still waiting to be pushed to Graph. */
export function usePendingChanges() {
  const db = useDatabase();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const subscription = liveQuery(() => countPendingChanges(db)).subscribe({
      next: setCount,
      error: () => setCount(0),
    });

    return () => subscription.unsubscribe();
  }, [db]);

  return count;
}
