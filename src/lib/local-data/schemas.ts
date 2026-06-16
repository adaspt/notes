import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoDateTimeSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/);

export const taskPrioritySchema = z.enum(["high", "normal", "low"]);
export const taskStatusSchema = z.enum(["notStarted", "completed", "deferred"]);

export const localTaskRecordSchema = z.object({
  id: z.string().min(1),
  remoteId: z.string().min(1).nullable(),
  title: z.string().min(1),
  body: z.string(),
  dueDate: isoDateSchema.nullable(),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  remoteUpdatedAt: isoDateTimeSchema.nullable(),
  updatedAt: isoDateTimeSchema,
});

export const noteTypeSchema = z.enum(["markdown", "list"]);

export const noteFrontmatterSchema = z.object({
  type: noteTypeSchema,
  starred: z.boolean(),
});

export const localProjectRecordSchema = z.object({
  id: z.string().min(1),
  driveItemId: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  remoteUpdatedAt: isoDateTimeSchema.nullable(),
  updatedAt: isoDateTimeSchema,
});

export const localNoteRecordSchema = z.object({
  id: z.string().min(1),
  driveItemId: z.string().min(1).nullable(),
  projectId: z.string().min(1).nullable(),
  name: z.string().min(1),
  path: z.string().min(1),
  type: noteTypeSchema,
  starred: z.boolean(),
  content: z.string(),
  remoteUpdatedAt: isoDateTimeSchema.nullable(),
  updatedAt: isoDateTimeSchema,
});

export const pendingTaskWriteSchema = z.object({
  taskId: z.string().min(1),
  operation: z.literal("upsert"),
  task: localTaskRecordSchema,
  updatedAt: isoDateTimeSchema,
});

export const pendingNoteUpsertWriteSchema = z.object({
  noteId: z.string().min(1),
  operation: z.literal("upsert"),
  note: localNoteRecordSchema,
  updatedAt: isoDateTimeSchema,
});

export const pendingNoteDeleteWriteSchema = z.object({
  noteId: z.string().min(1),
  operation: z.literal("delete"),
  driveItemId: z.string().min(1).nullable(),
  note: z.null(),
  updatedAt: isoDateTimeSchema,
});

export const pendingNoteWriteSchema = z.discriminatedUnion("operation", [
  pendingNoteUpsertWriteSchema,
  pendingNoteDeleteWriteSchema,
]);

export const syncStatusSchema = z.enum([
  "synced",
  "syncing",
  "offline",
  "offlineChanges",
  "syncFailed",
]);

export const globalSyncStateId = "global" as const;
export const defaultTaskDeltaCursorId = "default-task-list" as const;
export const defaultNoteDeltaCursorId = "app-root-notes" as const;

export const syncStateRecordSchema = z.object({
  id: z.literal(globalSyncStateId),
  status: syncStatusSchema,
  message: z.string().nullable(),
  lastSyncedAt: isoDateTimeSchema.nullable(),
  updatedAt: isoDateTimeSchema,
});

export const taskDeltaCursorRecordSchema = z.object({
  id: z.literal(defaultTaskDeltaCursorId),
  listId: z.string().min(1),
  deltaLink: z.string().url().nullable(),
  updatedAt: isoDateTimeSchema,
});

export const noteDeltaCursorRecordSchema = z.object({
  id: z.literal(defaultNoteDeltaCursorId),
  appRootDriveItemId: z.string().min(1),
  driveId: z.string().min(1),
  deltaLink: z.string().url().nullable(),
  updatedAt: isoDateTimeSchema,
});

export type LocalTaskRecord = z.infer<typeof localTaskRecordSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type NoteType = z.infer<typeof noteTypeSchema>;
export type NoteFrontmatter = z.infer<typeof noteFrontmatterSchema>;
export type LocalProjectRecord = z.infer<typeof localProjectRecordSchema>;
export type LocalNoteRecord = z.infer<typeof localNoteRecordSchema>;
export type PendingTaskWrite = z.infer<typeof pendingTaskWriteSchema>;
export type PendingNoteWrite = z.infer<typeof pendingNoteWriteSchema>;
export type SyncStatus = z.infer<typeof syncStatusSchema>;
export type SyncStateRecord = z.infer<typeof syncStateRecordSchema>;
export type TaskDeltaCursorRecord = z.infer<typeof taskDeltaCursorRecordSchema>;
export type NoteDeltaCursorRecord = z.infer<typeof noteDeltaCursorRecordSchema>;
