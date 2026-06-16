import { Plus, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { createNote } from "./note-mutations";

type NoteCreateFormProps = {
  projectId?: string | null;
  onCancel: () => void;
  onCreated: (noteId: string) => void;
};

function NoteCreateForm({ projectId = null, onCancel, onCreated }: NoteCreateFormProps) {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="h-full overflow-y-auto px-6 py-5"
      aria-label="Create note"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();

        setErrorMessage(null);
        setIsSubmitting(true);
        void createNote({ name, projectId })
          .then((note) => onCreated(note.id))
          .catch((error: unknown) => {
            setErrorMessage(getErrorMessage(error));
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      }}
    >
      <div className="space-y-5">
        <header className="border-b pb-4">
          <h2 className="text-xl font-semibold">New note</h2>
        </header>

        <label className="block space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Name</span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <div className="flex gap-2 border-t pt-5">
          <button
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium",
              "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
            )}
            type="submit"
            disabled={isSubmitting}
          >
            <Plus className="size-4" aria-hidden="true" />
            Create
          </button>
          <button
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium",
              "hover:bg-accent",
            )}
            type="button"
            onClick={onCancel}
          >
            <X className="size-4" aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Note create failed.";
}

export default NoteCreateForm;
