import { useForm } from "@tanstack/react-form";
import { Save, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { taskEditFormSchema, toTaskEditValues, type TaskEditFormValues } from "./task-edit-schema";
import { createTask, type TaskCreateValues } from "./task-mutations";

type TaskCreateFormProps = {
  defaultValues?: Omit<TaskCreateValues, "title">;
  onCancel: () => void;
  onCreated: (taskId: string) => void;
};

function TaskCreateForm({ defaultValues = {}, onCancel, onCreated }: TaskCreateFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: toTaskCreateFormValues(defaultValues),
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      const parsedValue = taskEditFormSchema.parse(value);
      const task = await createTask(toTaskEditValues(parsedValue));
      onCreated(task.id);
    },
  });

  return (
    <form
      className="h-full overflow-y-auto px-6 py-5"
      aria-label="Create task"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit().catch((error: unknown) => {
          setErrorMessage(getErrorMessage(error));
        });
      }}
    >
      <div className="space-y-5">
        <header className="border-b pb-4">
          <h2 className="text-xl font-semibold">New task</h2>
        </header>

        <form.Field name="title">
          {(field) => (
            <label className="block space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Title</span>
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={field.state.value}
                autoFocus
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

function toTaskCreateFormValues(values: Omit<TaskCreateValues, "title">): TaskEditFormValues {
  return {
    title: "",
    body: values.body ?? "",
    dueDate: values.dueDate ?? "",
    priority: values.priority ?? "normal",
    status: values.status ?? "notStarted",
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Task create failed.";
}

export default TaskCreateForm;
