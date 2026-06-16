import { Ellipsis, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { deleteNote, setNoteStarred } from "./note-mutations";

type NoteDetailActionsProps = {
  noteId: string;
  isStarred: boolean;
  noteTitle: string;
  onDeleted: () => void;
};

function NoteDetailActions({ noteId, isStarred, noteTitle, onDeleted }: NoteDetailActionsProps) {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStar, setIsUpdatingStar] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActionsMenuOpen) {
      return;
    }

    function closeMenuOnOutsidePointerDown(event: PointerEvent) {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenuOnOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsidePointerDown);
    };
  }, [isActionsMenuOpen]);

  function toggleStarred() {
    setErrorMessage(null);
    setIsUpdatingStar(true);
    void setNoteStarred(noteId, !isStarred)
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)))
      .finally(() => setIsUpdatingStar(false));
  }

  function confirmAndDelete() {
    const shouldDelete = window.confirm(
      `Delete "${noteTitle}"? You can recover it from OneDrive Recycle Bin.`,
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage(null);
    setIsDeleting(true);
    void deleteNote(noteId)
      .then(onDeleted)
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)))
      .finally(() => setIsDeleting(false));
  }

  return (
    <div className="space-y-2" aria-label="Note actions">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium",
            "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
            isStarred && "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
          )}
          type="button"
          aria-pressed={isStarred}
          disabled={isUpdatingStar || isDeleting}
          onClick={toggleStarred}
        >
          <Star className={cn("size-4", isStarred && "fill-current")} aria-hidden="true" />
          {isUpdatingStar ? "Updating" : isStarred ? "Starred" : "Star"}
        </button>
        <div className="relative" ref={actionsMenuRef}>
          <button
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md border",
              "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
            )}
            type="button"
            aria-label="More note actions"
            aria-expanded={isActionsMenuOpen}
            aria-haspopup="menu"
            disabled={isDeleting}
            onClick={() => setIsActionsMenuOpen((isOpen) => !isOpen)}
          >
            <Ellipsis className="size-4" aria-hidden="true" />
          </button>
          {isActionsMenuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-1 min-w-36 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              role="menu"
            >
              <button
                className={cn(
                  "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-xs font-medium",
                  "hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                )}
                type="button"
                role="menuitem"
                disabled={isDeleting}
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  confirmAndDelete();
                }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                {isDeleting ? "Deleting" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
      {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Note update failed.";
}

export default NoteDetailActions;
