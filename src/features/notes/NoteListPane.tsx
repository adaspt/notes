import type { ReactNode } from "react";

import CreateActionButton from "@/features/app-shell/CreateActionButton";
import { cn } from "@/lib/utils";

import type { NoteListItem } from "./note-data";

type NoteListPaneProps = {
  emptyState: string;
  floatingAction?: ReactNode;
  items: ReadonlyArray<NoteListItem>;
  selectedNoteId?: string;
  showHeader?: boolean;
  title: string;
  onCreateNote?: () => void;
  onSelectNote: (noteId: string) => void;
};

function NoteListPane({
  emptyState,
  floatingAction,
  items,
  selectedNoteId,
  showHeader = true,
  title,
  onCreateNote,
  onSelectNote,
}: NoteListPaneProps) {
  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden" aria-label={title}>
      {showHeader && (
        <header className="flex items-center justify-between gap-3 border-b px-4 py-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          {onCreateNote && (
            <CreateActionButton label="New note" variant="header" onClick={onCreateNote} />
          )}
        </header>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <ul className="divide-y">
            {items.map((note) => (
              <li key={note.id}>
                <button
                  className={cn(
                    "block w-full px-4 py-3 text-left hover:bg-accent",
                    selectedNoteId === note.id && "bg-accent",
                  )}
                  type="button"
                  onClick={() => onSelectNote(note.id)}
                >
                  <span className="block truncate text-sm font-medium">{note.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{note.statusLabel}</span>
                    <span aria-hidden="true">/</span>
                    <span>{note.activityLabel}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {emptyState}
          </div>
        )}
      </div>
      {floatingAction}
    </section>
  );
}

export default NoteListPane;
