import type { TaskRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateTask } from "@/features/tasks/data/task-mutations";
import { cn } from "@/lib/utils";
import { type KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  task: TaskRecord;
}

function TaskTitle({ task }: Props) {
  const db = useDatabase();
  const [draft, setDraft] = useState(task.title);
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraft(task.title);
  }, [task.id, task.title]);

  // Grow the field to fit its content so long titles wrap instead of scrolling.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [draft]);

  useEffect(() => {
    if (draft.trim() === task.title || draft.trim() === "") {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      void updateTask(db, task.id, { title: draft.trim() });
      timerRef.current = null;
    }, 700);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [db, draft, task.id, task.title]);

  const commit = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const title = draft.trim();
    if (!title) {
      setDraft(task.title);
      return;
    }

    if (title !== task.title) {
      void updateTask(db, task.id, { title });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      setDraft(task.title);
      event.currentTarget.blur();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={draft}
      onChange={(event) => setDraft(event.target.value.replaceAll("\n", ""))}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={cn(
        "block w-full resize-none overflow-hidden bg-transparent p-0 text-2xl font-semibold outline-none",
        "focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50",
      )}
    />
  );
}

export default TaskTitle;
