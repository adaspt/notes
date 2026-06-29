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
import { type CreateTaskInput, createTask } from "@/features/tasks/data/task-mutations";
import { useIsMobile } from "@/hooks/use-mobile";
import { type NavigateOptions, type RegisteredRouter, useNavigate } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";

interface Props {
  defaults?: Pick<CreateTaskInput, "dueDate" | "status">;
  onClose: () => void;
  getTaskPath: (taskId: string) => NavigateOptions<RegisteredRouter>;
}

function TaskCreateDialog({ defaults, onClose, getTaskPath }: Props) {
  const db = useDatabase();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const close = () => onClose();

  const submit = (event: SubmitEvent) => {
    event.preventDefault();

    const trimmed = title.trim();
    if (!trimmed || submitting) {
      return;
    }

    setSubmitting(true);
    void createTask(db, { title: trimmed, ...defaults })
      .then((task) => {
        void navigate(getTaskPath(task.id));
        onClose();
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not create task");
        setSubmitting(false);
      });
  };

  const fields = (
    <div className="grid gap-2">
      <Input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
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
              <SheetTitle>New task</SheetTitle>
              <SheetDescription>Give the task a title.</SheetDescription>
            </SheetHeader>
            <div className="px-4">{fields}</div>
            <SheetFooter>
              <Button type="submit" disabled={!title.trim() || submitting}>
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
            <AlertDialogTitle>New task</AlertDialogTitle>
            <AlertDialogDescription>Give the task a title.</AlertDialogDescription>
          </AlertDialogHeader>
          {fields}
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={close}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={!title.trim() || submitting}>
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default TaskCreateDialog;
