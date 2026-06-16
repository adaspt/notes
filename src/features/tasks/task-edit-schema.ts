import { z } from "zod";

import type { LocalTaskRecord } from "@/lib/local-data";

import type { TaskEditValues } from "./task-mutations";

export const taskEditFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z.string(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .or(z.literal("")),
  priority: z.enum(["high", "normal", "low"]),
  status: z.enum(["notStarted", "completed", "deferred"]),
});

export type TaskEditFormValues = z.infer<typeof taskEditFormSchema>;

export function toTaskEditFormValues(task: LocalTaskRecord): TaskEditFormValues {
  return {
    title: task.title,
    body: task.body,
    dueDate: task.dueDate ?? "",
    priority: task.priority,
    status: task.status,
  };
}

export function toTaskEditValues(values: TaskEditFormValues): TaskEditValues {
  return {
    title: values.title.trim(),
    body: values.body,
    dueDate: values.dueDate || null,
    priority: values.priority,
    status: values.status,
  };
}
