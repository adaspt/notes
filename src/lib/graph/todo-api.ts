import type { Recurrence, TaskRecord } from "@/data/schemas";
import type { GraphClient } from "@/lib/graph/graph-client";
import { z } from "zod";

// ---- Public types -------------------------------------------------------

export interface TodoTaskList {
  id: string;
}

export interface TodoDeltaPage {
  value: TodoDeltaItem[];
  nextLink: string | null;
  deltaLink: string | null;
}

export type TodoDeltaItem = TodoRemovedTask | TodoTask;

export interface TodoRemovedTask {
  id: string;
  removed: true;
}

export interface TodoTask {
  id: string;
  title: string;
  body: string;
  dueDate: Date | null;
  reminder: Date | null;
  recurrence: Recurrence | null;
  priority: TodoPriority;
  status: TodoStatus;
  updatedAt: Date;
}

// ---- Graph response schemas (validate + transform at the API boundary) --

const graphItemBodySchema = z.object({
  content: z.string(),
  contentType: z.enum(["text", "html"]),
});

const graphDateTimeSchema = z.object({
  dateTime: z.string(),
  timeZone: z.string(),
});

const todoPrioritySchema = z.enum(["high", "normal", "low"]);
const todoStatusSchema = z.enum([
  "notStarted",
  "inProgress",
  "completed",
  "waitingOnOthers",
  "deferred",
]);
const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);
const recurrencePatternSchema = z.object({
  type: z.enum([
    "daily",
    "weekly",
    "absoluteMonthly",
    "relativeMonthly",
    "absoluteYearly",
    "relativeYearly",
  ]),
  interval: z.number(),
  month: z.number().optional(),
  dayOfMonth: z.number().optional(),
  daysOfWeek: z.array(dayOfWeekSchema).optional(),
  firstDayOfWeek: dayOfWeekSchema.optional(),
  index: z.enum(["first", "second", "third", "fourth", "last"]).optional(),
});
const recurrenceRangeSchema = z.object({
  type: z.enum(["endDate", "noEnd", "numbered"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  recurrenceTimeZone: z.string().optional(),
  numberOfOccurrences: z.number().optional(),
});
const recurrenceSchema = z.object({
  pattern: recurrencePatternSchema,
  range: recurrenceRangeSchema,
});

type TodoPriority = z.infer<typeof todoPrioritySchema>;
type TodoStatus = z.infer<typeof todoStatusSchema>;

const graphTodoTaskSchema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    body: graphItemBodySchema.optional(),
    dueDateTime: graphDateTimeSchema.nullable().optional(),
    reminderDateTime: graphDateTimeSchema.nullable().optional(),
    isReminderOn: z.boolean().optional(),
    recurrence: recurrenceSchema.nullable().optional(),
    importance: todoPrioritySchema.optional(),
    status: todoStatusSchema.optional(),
    lastModifiedDateTime: z.string().optional(),
    "@removed": z.object({ reason: z.string().optional() }).optional(),
  })
  .transform((raw): TodoTask | TodoRemovedTask => {
    if (raw["@removed"]) {
      return { id: raw.id, removed: true };
    }

    return {
      id: raw.id,
      title: raw.title ?? "",
      body: toPlainText(raw.body),
      dueDate: toLocalDate(raw.dueDateTime),
      reminder: raw.isReminderOn ? toUtcDate(raw.reminderDateTime) : null,
      recurrence: raw.recurrence ?? null,
      priority: raw.importance ?? "normal",
      status: raw.status ?? "notStarted",
      updatedAt: raw.lastModifiedDateTime ? new Date(raw.lastModifiedDateTime) : new Date(),
    };
  });

const graphTodoDeltaPageSchema = z
  .object({
    value: z.array(graphTodoTaskSchema),
    "@odata.nextLink": z.string().optional(),
    "@odata.deltaLink": z.string().optional(),
  })
  .transform(
    (raw): TodoDeltaPage => ({
      value: raw.value,
      nextLink: raw["@odata.nextLink"] ?? null,
      deltaLink: raw["@odata.deltaLink"] ?? null,
    }),
  );

const graphTodoTaskListSchema = z.object({
  id: z.string(),
  wellknownListName: z.string().optional(),
});

const graphTodoTaskListPageSchema = z.object({
  value: z.array(graphTodoTaskListSchema),
});

// Schema for a single task response (create / update) — no @removed possible.
const graphTodoTaskResponseSchema = graphTodoTaskSchema.transform((item) => {
  if ("removed" in item) {
    throw new Error("Unexpected @removed in task create/update response");
  }
  return item as TodoTask;
});

// ---- API functions ------------------------------------------------------

export async function getDefaultList(graph: GraphClient): Promise<TodoTaskList> {
  // Server-side $filter/$select on the todo lists endpoint is unreliable on Graph (the enum
  // filter 500s and $select fails URI parsing), so fetch the lists (there are only a handful)
  // unmodified and pick the default one client-side. wellknownListName is returned by default.
  const page = await graph.get("/me/todo/lists", graphTodoTaskListPageSchema);
  const list = page.value.find((item) => item.wellknownListName === "defaultList");

  if (!list) {
    throw new Error("Default Microsoft To Do list was not found");
  }

  return { id: list.id };
}

export async function tasksDelta(
  graph: GraphClient,
  listId: string,
  link: string | null,
): Promise<TodoDeltaPage> {
  return await graph.get(
    link ?? `/me/todo/lists/${encodeURIComponent(listId)}/tasks/delta`,
    graphTodoDeltaPageSchema,
  );
}

export async function createTask(
  graph: GraphClient,
  listId: string,
  task: TaskRecord,
): Promise<TodoTask> {
  return await graph.post(
    `/me/todo/lists/${encodeURIComponent(listId)}/tasks`,
    graphTodoTaskResponseSchema,
    toGraphTask(task),
  );
}

export async function getTask(
  graph: GraphClient,
  listId: string,
  remoteId: string,
): Promise<TodoTask> {
  return await graph.get(
    `/me/todo/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(remoteId)}`,
    graphTodoTaskResponseSchema,
  );
}

export async function updateTask(
  graph: GraphClient,
  listId: string,
  remoteId: string,
  task: TaskRecord,
): Promise<TodoTask> {
  return await graph.patch(
    `/me/todo/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(remoteId)}`,
    graphTodoTaskResponseSchema,
    // Microsoft To Do currently rejects recurrence.range.startDate when recurrence is
    // included in a PATCH, even though the documented Edm.Date wire format is used.
    // TaskSync checks the current recurrence first and replaces the task when it changed.
    toGraphTask(task, false),
  );
}

export async function deleteTask(
  graph: GraphClient,
  listId: string,
  remoteId: string,
): Promise<void> {
  await graph.delete(
    `/me/todo/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(remoteId)}`,
  );
}

// ---- Outbound mapping (we control the input, no validation needed) ------

interface GraphTodoTaskInput {
  title: string;
  body: { content: string; contentType: "text" };
  dueDateTime: { dateTime: string; timeZone: string } | null;
  reminderDateTime: { dateTime: string; timeZone: string } | null;
  isReminderOn: boolean;
  recurrence?: Recurrence | null;
  importance: TodoPriority;
  status: TodoStatus;
}

const toGraphTask = (task: TaskRecord, includeRecurrence = true): GraphTodoTaskInput => ({
  title: task.title,
  body: { content: task.body, contentType: "text" },
  dueDateTime: toGraphDate(task.dueDate),
  reminderDateTime: toGraphDateTime(task.reminder),
  isReminderOn: task.reminder !== null,
  ...(includeRecurrence ? { recurrence: task.recurrence } : {}),
  importance: task.priority,
  status: task.status,
});

const toPlainText = (body: { content: string; contentType: string } | undefined): string => {
  if (!body) return "";
  const text =
    body.contentType === "text"
      ? body.content
      : typeof DOMParser !== "undefined"
        ? (new DOMParser().parseFromString(body.content, "text/html").body.textContent ?? "")
        : body.content.replaceAll(/<[^>]*>/g, "");
  // Microsoft To Do represents an empty note as an HTML wrapper that parses to whitespace;
  // collapse those to "" so the empty body is genuinely empty (and the placeholder shows).
  return text.trim();
};

const toLocalDate = (value: { dateTime: string } | null | undefined): Date | null => {
  if (!value) return null;
  const [year = "", month = "", day = ""] = value.dateTime.slice(0, 10).split("-");
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const toUtcDate = (value: { dateTime: string } | null | undefined): Date | null => {
  if (!value) return null;
  const suffix = value.dateTime.endsWith("Z") ? "" : "Z";
  const date = new Date(`${value.dateTime}${suffix}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toGraphDate = (date: Date | null) => {
  if (!date) return null;
  return {
    dateTime: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`,
    timeZone: "UTC",
  };
};

const toGraphDateTime = (date: Date | null) => {
  if (!date) return null;
  return {
    dateTime: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`,
    timeZone: "UTC",
  };
};

const pad = (value: number) => value.toString().padStart(2, "0");
