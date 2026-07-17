import { SeverityLevel } from "@microsoft/applicationinsights-web";
import type { Database } from "@/data/database";
import type { Recurrence, RecurrencePattern, SyncState, TaskRecord } from "@/data/schemas";
import { GraphApiError, type GraphClient } from "@/lib/graph/graph-client";
import * as todo from "@/lib/graph/todo-api";
import type { TodoTask } from "@/lib/graph/todo-api";
import { createId } from "@/lib/id";
import { appInsights } from "@/lib/telemetry";

type TaskSyncState = SyncState & { scope: "tasks"; listId: string };

export class TaskSync {
  constructor(db: Database, graph: GraphClient) {
    this.#db = db;
    this.#graph = graph;
  }

  #db: Database;
  #graph: GraphClient;

  async syncNow() {
    const state = await this.#ensureState();
    await this.#pull(state);
    await this.#push(state);
  }

  async #ensureState(): Promise<TaskSyncState> {
    const existing = await this.#db.syncState.get("tasks");
    const state: SyncState = existing ?? { scope: "tasks", listId: null, deltaLink: null };

    if (!state.listId) {
      const list = await todo.getDefaultList(this.#graph);
      state.listId = list.id;
      await this.#db.syncState.put(state);
    }

    return state as TaskSyncState;
  }

  async #pull(state: TaskSyncState) {
    let link = state.deltaLink;

    for (;;) {
      try {
        const page = await todo.tasksDelta(this.#graph, state.listId, link);

        for (const item of page.value) {
          if ("removed" in item) {
            await this.#deleteRemoteRemovedTask(item.id);
          } else {
            await this.#applyRemoteTask(item);
          }
        }

        if (page.nextLink) {
          link = page.nextLink;
          continue;
        }

        state.deltaLink = page.deltaLink;
        await this.#db.syncState.put(state);
        return;
      } catch (error) {
        if (isExpiredDeltaError(error) && state.deltaLink) {
          state.deltaLink = null;
          link = null;
          await this.#db.syncState.put(state);
          continue;
        }

        throw error;
      }
    }
  }

  async #applyRemoteTask(remote: TodoTask) {
    const existing = await this.#db.tasks.where("remoteId").equals(remote.id).first();
    const remoteRecord = toLocalRecord(remote, existing?.id ?? createId());

    if (!existing) {
      await this.#db.tasks.add(remoteRecord);
      return;
    }

    if (remote.updatedAt.getTime() >= existing.updatedAt.getTime()) {
      await this.#db.tasks.put(remoteRecord);
    }
  }

  async #deleteRemoteRemovedTask(remoteId: string) {
    const existing = await this.#db.tasks.where("remoteId").equals(remoteId).first();

    if (existing) {
      await this.#db.tasks.delete(existing.id);
    }
  }

  async #push(state: TaskSyncState) {
    const dirtyTasks = await this.#db.tasks.where("syncStatus").equals("dirty").toArray();

    for (const snapshot of dirtyTasks) {
      try {
        if (snapshot.deletedAt) {
          await this.#pushDelete(state, snapshot);
        } else if (!snapshot.remoteId) {
          await this.#pushCreate(state, snapshot);
        } else {
          await this.#pushUpdate(state, snapshot, snapshot.remoteId);
        }
      } catch (error) {
        appInsights.trackException({
          exception: error instanceof Error ? error : new Error(String(error)),
          severityLevel: SeverityLevel.Warning,
          properties: {
            scope: "tasks",
            operation: snapshot.deletedAt ? "delete" : !snapshot.remoteId ? "create" : "update",
            recordId: snapshot.id,
          },
        });
        // Isolate per-task failures so one bad task doesn't strand the rest of the queue;
        // it stays dirty and is retried on the next sync.
        console.error(`Failed to push task ${snapshot.id}`, error);
      }
    }
  }

  async #pushDelete(state: TaskSyncState, snapshot: TaskRecord) {
    if (snapshot.remoteId) {
      await todo.deleteTask(this.#graph, state.listId, snapshot.remoteId);
    }

    const current = await this.#db.tasks.get(snapshot.id);
    if (!current) {
      return;
    }

    if (matchesSnapshot(current, snapshot)) {
      await this.#db.tasks.delete(snapshot.id);
    } else if (snapshot.remoteId && current.remoteId === snapshot.remoteId) {
      await this.#db.tasks.put({ ...current, remoteId: null });
    }
  }

  async #pushCreate(state: TaskSyncState, snapshot: TaskRecord) {
    const created = await todo.createTask(this.#graph, state.listId, snapshot);
    const current = await this.#db.tasks.get(snapshot.id);
    if (!current) {
      return;
    }

    if (matchesSnapshot(current, snapshot)) {
      await this.#db.tasks.put(toLocalRecord(created, snapshot.id));
    } else {
      await this.#db.tasks.put({ ...current, remoteId: created.id });
    }
  }

  async #pushUpdate(state: TaskSyncState, snapshot: TaskRecord, remoteId: string) {
    // Graph's To Do endpoint cannot PATCH recurrence ranges: it tries to deserialize the
    // correctly formatted YYYY-MM-DD string as a different Edm.Date representation and
    // returns invalidRequest. Check the remote value before applying any changes so a
    // failed replacement cannot leave the old task partially updated.
    const remote = await todo.getTask(this.#graph, state.listId, remoteId);
    if (!recurrencesMatch(remote.recurrence, snapshot.recurrence)) {
      await this.#replaceForRecurrenceChange(state, snapshot, remoteId);
      return;
    }

    // Recurrence is unchanged, so it is safe to omit it from this PATCH.
    const updated = await todo.updateTask(this.#graph, state.listId, remoteId, snapshot);
    const current = await this.#db.tasks.get(snapshot.id);

    if (current && matchesSnapshot(current, snapshot)) {
      await this.#db.tasks.put(toLocalRecord(updated, snapshot.id));
    }
  }

  async #replaceForRecurrenceChange(state: TaskSyncState, snapshot: TaskRecord, remoteId: string) {
    const created = await todo.createTask(this.#graph, state.listId, snapshot);
    await todo.deleteTask(this.#graph, state.listId, remoteId);

    const current = await this.#db.tasks.get(snapshot.id);
    if (!current) {
      return;
    }

    if (matchesSnapshot(current, snapshot)) {
      await this.#db.tasks.put(toLocalRecord(created, snapshot.id));
    } else if (current.remoteId === remoteId) {
      // Preserve edits made while the network requests were in flight. The next sync will
      // apply them to the replacement rather than targeting the deleted Graph task.
      await this.#db.tasks.put({ ...current, remoteId: created.id });
    }
  }
}

const toLocalRecord = (remote: TodoTask, id: string): TaskRecord => ({
  id,
  title: remote.title,
  body: remote.body,
  dueDate: remote.dueDate,
  reminder: remote.reminder,
  recurrence: remote.recurrence,
  priority: remote.priority,
  status: remote.status,
  remoteId: remote.id,
  updatedAt: remote.updatedAt,
  syncStatus: "synced",
  deletedAt: null,
});

const matchesSnapshot = (current: TaskRecord, snapshot: TaskRecord) =>
  current.updatedAt.getTime() === snapshot.updatedAt.getTime() &&
  current.deletedAt?.getTime() === snapshot.deletedAt?.getTime() &&
  current.syncStatus === snapshot.syncStatus &&
  current.remoteId === snapshot.remoteId;

const recurrencesMatch = (left: Recurrence | null, right: Recurrence | null) => {
  if (!left || !right) {
    return left === right;
  }

  return (
    patternsMatch(left.pattern, right.pattern) &&
    left.range.type === right.range.type &&
    left.range.startDate === right.range.startDate &&
    (left.range.recurrenceTimeZone ?? "UTC") === (right.range.recurrenceTimeZone ?? "UTC") &&
    (left.range.type !== "endDate" || left.range.endDate === right.range.endDate) &&
    (left.range.type !== "numbered" ||
      left.range.numberOfOccurrences === right.range.numberOfOccurrences)
  );
};

const patternsMatch = (left: RecurrencePattern, right: RecurrencePattern) => {
  if (left.type !== right.type || left.interval !== right.interval) {
    return false;
  }

  switch (left.type) {
    case "daily":
      return true;
    case "weekly":
      return (
        sameDays(left.daysOfWeek, right.daysOfWeek) &&
        (left.firstDayOfWeek ?? "sunday") === (right.firstDayOfWeek ?? "sunday")
      );
    case "absoluteMonthly":
      return left.dayOfMonth === right.dayOfMonth;
    case "relativeMonthly":
      return left.index === right.index && sameDays(left.daysOfWeek, right.daysOfWeek);
    case "absoluteYearly":
      return left.month === right.month && left.dayOfMonth === right.dayOfMonth;
    case "relativeYearly":
      return (
        left.month === right.month &&
        left.index === right.index &&
        sameDays(left.daysOfWeek, right.daysOfWeek)
      );
  }
};

const sameDays = (left: string[] | undefined, right: string[] | undefined) =>
  (left?.length ?? 0) === (right?.length ?? 0) && (left ?? []).every((day) => right?.includes(day));

export const isExpiredDeltaError = (error: unknown) =>
  error instanceof GraphApiError &&
  (error.status === 410 || error.code === "syncStateNotFound" || error.code === "resyncRequired");
