export type TaskPriority = "high" | "normal" | "low";
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type RecurrencePatternType =
  | "daily"
  | "weekly"
  | "absoluteMonthly"
  | "relativeMonthly"
  | "absoluteYearly"
  | "relativeYearly";

export type RecurrenceRangeType = "endDate" | "noEnd" | "numbered";

export interface RecurrencePattern {
  type: RecurrencePatternType;
  interval: number;
  month?: number;
  dayOfMonth?: number;
  daysOfWeek?: DayOfWeek[];
  firstDayOfWeek?: DayOfWeek;
  index?: "first" | "second" | "third" | "fourth" | "last";
}

export interface RecurrenceRange {
  type: RecurrenceRangeType;
  startDate: string;
  endDate?: string;
  recurrenceTimeZone?: string;
  numberOfOccurrences?: number;
}

export interface Recurrence {
  pattern: RecurrencePattern;
  range: RecurrenceRange;
}

export interface SyncState {
  scope: "tasks" | "notes";
  listId: string | null;
  deltaLink: string | null;
}
export type TaskStatus = "notStarted" | "inProgress" | "completed" | "waitingOnOthers" | "deferred";
export type SyncStatus = "synced" | "dirty";
// IndexedDB cannot index booleans, so flags that need an index are stored as 0 | 1.
export type Flag = 0 | 1;

export interface TaskRecord {
  id: string;
  title: string;
  body: string;
  dueDate: Date | null;
  reminder: Date | null;
  recurrence: Recurrence | null;
  priority: TaskPriority;
  status: TaskStatus;
  remoteId: string | null;
  updatedAt: Date;
  syncStatus: SyncStatus;
  deletedAt: Date | null;
}

export interface NoteRecord {
  id: string;
  remoteId: string | null;
  title: string;
  lastSyncedTitle: string | null;
  body: string;
  starred: Flag;
  projectId: string | null;
  updatedAt: Date;
  syncStatus: SyncStatus;
  deletedAt: Date | null;
}

export interface ProjectRecord {
  id: string;
  remoteId: string | null;
  name: string;
}
