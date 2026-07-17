import { SeverityLevel } from "@microsoft/applicationinsights-web";
import type { Database } from "@/data/database";
import { GraphApiError, GraphNetworkError, type GraphClient } from "@/lib/graph/graph-client";
import { appInsights } from "@/lib/telemetry";
import { AuthDeferredError } from "@/features/auth/session";
import { NoteSync } from "./note-sync";
import { TaskSync } from "./task-sync";

const syncIntervalMs = 5 * 60 * 1000;

/**
 * A sync failure we expect to recover from on its own (offline, dropped connection,
 * deferred token, throttling, or a transient Graph server error). These leave dirty
 * records queued for the next attempt; anything else (schema/data/programming bugs)
 * should propagate so it isn't silently swallowed.
 */
function isTransientSyncError(error: unknown): boolean {
  if (error instanceof AuthDeferredError) {
    return true;
  }
  // The request never reached Graph (offline / connection dropped mid-sync).
  if (error instanceof GraphNetworkError) {
    return true;
  }
  if (error instanceof GraphApiError) {
    return error.status === 401 || error.status === 429 || error.status >= 500;
  }
  return false;
}

export class Sync {
  constructor(db: Database, graph: GraphClient) {
    this.#taskSync = new TaskSync(db, graph);
    this.#noteSync = new NoteSync(db, graph);
  }

  #taskSync: TaskSync;
  #noteSync: NoteSync;
  #isSyncing = false;
  #intervalId: number | null = null;
  #subscribers: Array<(isSyncing: boolean) => void> = [];

  subscribe(fn: (isSyncing: boolean) => void) {
    this.#subscribers.push(fn);
    fn(this.#isSyncing);
    return () => {
      const index = this.#subscribers.indexOf(fn);
      if (index >= 0) this.#subscribers.splice(index, 1);
    };
  }

  initialize() {
    const syncWhenVisible = () => {
      if (document.hidden) {
        this.#stopInterval();
        return;
      }

      void this.syncNow();
      this.#startInterval();
    };

    const syncWhenOnline = () => {
      void this.syncNow();
    };

    document.addEventListener("visibilitychange", syncWhenVisible);
    window.addEventListener("online", syncWhenOnline);
    syncWhenVisible();

    return () => {
      document.removeEventListener("visibilitychange", syncWhenVisible);
      window.removeEventListener("online", syncWhenOnline);
      this.#stopInterval();
    };
  }

  async syncNow() {
    // No point hitting the network while offline; dirty records stay queued and the
    // "online" listener triggers a sync on reconnect.
    if (!navigator.onLine || this.#isSyncing) {
      return;
    }

    this.#isSyncing = true;
    this.#subscribers.forEach((fn) => fn(true));

    let scope: "tasks" | "notes" = "tasks";
    try {
      await this.#taskSync.syncNow();
      scope = "notes";
      await this.#noteSync.syncNow();
    } catch (error) {
      const transient = isTransientSyncError(error);
      appInsights.trackException({
        exception: error instanceof Error ? error : new Error(String(error)),
        severityLevel: transient ? SeverityLevel.Warning : SeverityLevel.Error,
        properties: { scope, transient },
      });

      if (!transient) {
        throw error;
      }
      // Connection dropped mid-sync, token deferred, throttled, or a transient Graph
      // error: leave dirty records queued for the next attempt without surfacing.
      console.warn("Sync deferred due to a transient network/auth error", error);
    } finally {
      this.#isSyncing = false;
      this.#subscribers.forEach((fn) => fn(false));
    }
  }

  #startInterval() {
    if (this.#intervalId !== null) {
      return;
    }

    this.#intervalId = window.setInterval(() => {
      void this.syncNow();
    }, syncIntervalMs);
  }

  #stopInterval() {
    if (this.#intervalId === null) {
      return;
    }

    window.clearInterval(this.#intervalId);
    this.#intervalId = null;
  }
}
