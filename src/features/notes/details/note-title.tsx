import type { NoteRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateNote } from "@/features/notes/data/note-mutations";
import { isTitleAvailable, isValidTitle, normalizeTitle } from "@/features/notes/data/note-title";
import { cn } from "@/lib/utils";
import { type KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  note: NoteRecord;
}

function NoteTitle({ note }: Props) {
  const db = useDatabase();
  const [draft, setDraft] = useState(note.title);
  const [error, setError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const commitVersionRef = useRef(0);

  useEffect(() => {
    commitVersionRef.current += 1;
    setDraft(note.title);
    setError(false);
  }, [note.id, note.title]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [draft]);

  const commit = () => {
    const commitVersion = (commitVersionRef.current += 1);
    const title = normalizeTitle(draft);
    if (title === note.title) {
      setDraft(note.title);
      setError(false);
      return;
    }

    if (!isValidTitle(title)) {
      setError(true);
      setDraft(note.title);
      return;
    }

    void isTitleAvailable(db, note.projectId, title, note.id)
      .then((available) => {
        if (commitVersion !== commitVersionRef.current) return;

        if (!available) {
          setError(true);
          setDraft(note.title);
          return;
        }

        void updateNote(db, note.id, { title })
          .then(() => {
            if (commitVersion !== commitVersionRef.current) return;
            setError(false);
          })
          .catch(() => {
            if (commitVersion !== commitVersionRef.current) return;
            setError(true);
            setDraft(note.title);
          });
      })
      .catch(() => {
        if (commitVersion !== commitVersionRef.current) return;
        setError(true);
        setDraft(note.title);
      });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      setDraft(note.title);
      setError(false);
      event.currentTarget.blur();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={draft}
      onChange={(event) => {
        commitVersionRef.current += 1;
        setError(false);
        setDraft(event.target.value.replaceAll("\n", ""));
      }}
      onBlur={commit}
      onKeyDown={onKeyDown}
      aria-invalid={error ? true : undefined}
      className={cn(
        "block w-full resize-none overflow-hidden bg-transparent p-0 text-2xl font-semibold outline-none",
        "focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50",
        error && "text-destructive",
      )}
    />
  );
}

export default NoteTitle;
