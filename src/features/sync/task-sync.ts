import type { Database } from "@/data/database";
import type { SyncState, TaskRecord } from "@/data/schemas";
import { GraphApiError, type GraphClient } from "@/lib/graph/graph-client";
import * as todo from "@/lib/graph/todo-api";
import type { TodoTask } from "@/lib/graph/todo-api";
import { createId } from "@/lib/id";

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
    const updated = await todo.updateTask(this.#graph, state.listId, remoteId, snapshot);
    const current = await this.#db.tasks.get(snapshot.id);

    if (current && matchesSnapshot(current, snapshot)) {
      await this.#db.tasks.put(toLocalRecord(updated, snapshot.id));
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

export const isExpiredDeltaError = (error: unknown) =>
  error instanceof GraphApiError &&
  (error.status === 410 || error.code === "syncStateNotFound" || error.code === "resyncRequired");
