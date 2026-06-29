import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDatabase } from "@/data/use-database";
import { createNote } from "@/features/notes/data/note-mutations";
import { isTitleAvailable, isValidTitle, normalizeTitle } from "@/features/notes/data/note-title";
import { useIsMobile } from "@/hooks/use-mobile";
import { type NavigateOptions, type RegisteredRouter, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type SubmitEvent } from "react";

interface Props {
  projectId: string | null;
  starred?: boolean;
  onClose: () => void;
  getNotePath: (noteId: string) => NavigateOptions<RegisteredRouter>;
}

function NoteCreateDialog({ projectId, starred = false, onClose, getNotePath }: Props) {
  const db = useDatabase();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const normalized = normalizeTitle(title);
    if (!normalized) {
      setError(null);
      return;
    }

    if (!isValidTitle(normalized)) {
      setError('Titles cannot contain \\ / : * ? " < > |');
      return;
    }

    void isTitleAvailable(db, projectId, normalized)
      .then((available) => {
        if (!active) return;
        setError(available ? null : "A note with this title already exists here");
      })
      .catch(() => {
        if (!active) return;
        setError("Could not check note title");
      });

    return () => {
      active = false;
    };
  }, [db, projectId, title]);

  const close = () => onClose();

  const submit = (event: SubmitEvent) => {
    event.preventDefault();

    const normalized = normalizeTitle(title);
    if (!isValidTitle(normalized) || error || submitting) {
      return;
    }

    setSubmitting(true);
    void createNote(db, { title: normalized, projectId, starred })
      .then((note) => {
        void navigate(getNotePath(note.id));
        onClose();
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not create note");
        setSubmitting(false);
      });
  };

  const disabled = !normalizeTitle(title) || error !== null || submitting;

  const fields = (
    <div className="grid gap-2">
      <Input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Note title"
        aria-invalid={error ? true : undefined}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <SheetContent side="bottom" showCloseButton={false}>
          <form onSubmit={submit} className="contents">
            <SheetHeader>
              <SheetTitle>New note</SheetTitle>
              <SheetDescription>Choose a filename for the markdown note.</SheetDescription>
            </SheetHeader>
            <div className="px-4">{fields}</div>
            <SheetFooter>
              <Button type="submit" disabled={disabled}>
                Create
              </Button>
              <SheetClose render={<Button variant="outline" type="button" />}>Cancel</SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>New note</AlertDialogTitle>
            <AlertDialogDescription>
              Choose a filename for the markdown note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {fields}
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={close}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={disabled}>
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default NoteCreateDialog;
