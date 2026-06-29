import type { TaskRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateTask } from "@/features/tasks/data/task-mutations";
import { useEffect, useRef, useState } from "react";

interface Props {
  task: TaskRecord;
}

function TaskBody({ task }: Props) {
  const db = useDatabase();
  const [draft, setDraft] = useState(task.body);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setDraft(task.body);
  }, [task.id, task.body]);

  useEffect(() => {
    if (draft === task.body) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      void updateTask(db, task.id, { body: draft });
      timerRef.current = null;
    }, 700);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [db, draft, task.body, task.id]);

  const commit = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (draft !== task.body) {
      void updateTask(db, task.id, { body: draft });
    }
  };

  return (
    <textarea
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      placeholder="Add notes"
      className="min-h-0 w-full flex-1 resize-none overflow-auto bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
    />
  );
}

export default TaskBody;
