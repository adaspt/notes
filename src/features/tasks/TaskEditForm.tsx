import { useForm } from "@tanstack/react-form";
import { Save, X } from "lucide-react";
import { useState } from "react";

import type { LocalTaskRecord } from "@/lib/local-data";
import { cn } from "@/lib/utils";

import {
  taskEditFormSchema,
  toTaskEditFormValues,
  toTaskEditValues,
  type TaskEditFormValues,
} from "./task-edit-schema";
import { editTask } from "./task-mutations";

type TaskEditFormProps = {
  task: LocalTaskRecord;
  onCancel: () => void;
  onSaved: () => void;
};

function TaskEditForm({ task, onCancel, onSaved }: TaskEditFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: toTaskEditFormValues(task),
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      const parsedValue = taskEditFormSchema.parse(value);
      await editTask(task.id, toTaskEditValues(parsedValue));
      onSaved();
    },
  });

  return (
    <form
      className="h-full overflow-y-auto px-6 py-5"
      aria-label="Edit task"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit().catch((error: unknown) => {
          setErrorMessage(getErrorMessage(error));
        });
      }}
    >
      <div className="space-y-5">
        <form.Field name="title">
          {(field) => (
            <label className="block space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Title</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>

        <form.Field name="body">
          {(field) => (
            <label className="block space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Notes</span>
              <textarea
                className="min-h-36 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <form.Field name="dueDate">
            {(field) => (
              <label className="block space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Due date</span>
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </label>
            )}
          </form.Field>

          <form.Field name="priority">
            {(field) => (
              <label className="block space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Priority</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value as TaskEditFormValues["priority"])
                  }
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </label>
            )}
          </form.Field>

          <form.Field name="status">
            {(field) => (
              <label className="block space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value as TaskEditFormValues["status"])
                  }
                >
                  <option value="notStarted">Not started</option>
                  <option value="completed">Completed</option>
                  <option value="deferred">Deferred</option>
                </select>
              </label>
            )}
          </form.Field>
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <div className="flex gap-2 border-t pt-5">
          <button
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium",
              "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
            )}
            type="submit"
          >
            <Save className="size-4" aria-hidden="true" />
            Save
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
  return error instanceof Error ? error.message : "Task save failed.";
}

export default TaskEditForm;
