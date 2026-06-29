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
import type { TaskRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { deleteTask } from "@/features/tasks/data/task-mutations";

interface Props {
  task: TaskRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToList: () => void;
}

function TaskDeleteDialog({ task, open, onOpenChange, onNavigateToList }: Props) {
  const db = useDatabase();

  const confirmDelete = async () => {
    await deleteTask(db, task.id);
    onNavigateToList();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the task locally and from Microsoft To Do on the next sync.
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

export default TaskDeleteDialog;
