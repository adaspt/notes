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
import type { NoteRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { deleteNote } from "@/features/notes/data/note-mutations";

interface Props {
  note: NoteRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToList: () => void;
}

function NoteDeleteDialog({ note, open, onOpenChange, onNavigateToList }: Props) {
  const db = useDatabase();

  const confirmDelete = async () => {
    await deleteNote(db, note.id);
    onNavigateToList();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete note?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the note locally and from OneDrive on the next sync.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => void confirmDelete()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default NoteDeleteDialog;
