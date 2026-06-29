import type { Database } from "@/data/database";
import type { NoteRecord, SyncState } from "@/data/schemas";
import { toFilename } from "@/features/notes/data/note-title";
import * as drive from "@/lib/graph/drive-api";
import type { DriveItem } from "@/lib/graph/drive-api";
import type { GraphClient } from "@/lib/graph/graph-client";
import { createId } from "@/lib/id";
import { isExpiredDeltaError } from "./task-sync";

type NoteSyncState = SyncState & { scope: "notes"; listId: string };

export class NoteSync {
  constructor(db: Database, graph: GraphClient) {
    this.#db = db;
    this.#graph = graph;
  }

  #db: Database;
  #graph: GraphClient;

  async syncNow() {
    const state = await this.#ensureState();
    await this.#pull(state);
    await this.#push();
  }

  async #ensureState(): Promise<NoteSyncState> {
    const existing = await this.#db.syncState.get("notes");
    const state: SyncState = existing ?? { scope: "notes", listId: null, deltaLink: null };

    if (!state.listId) {
      const root = await drive.getAppRoot(this.#graph);
      state.listId = root.id;
      await this.#db.syncState.put(state);
    }

    return state as NoteSyncState;
  }

  async #pull(state: NoteSyncState) {
    let link = state.deltaLink;

    for (;;) {
      try {
        const page = await drive.filesDelta(this.#graph, link);

        for (const folder of page.value.filter((item) => item.isFolder && !item.removed)) {
          await this.#applyRemoteFolder(state, folder);
        }

        for (const file of page.value.filter((item) => item.isFile && !item.removed)) {
          await this.#applyRemoteFile(state, file);
        }

        // Removed items carry no file/folder facet, so handle them in one pass that
        // covers both a deleted note and a deleted project folder (cascading its notes).
        for (const removed of page.value.filter((item) => item.removed)) {
          await this.#applyRemoval(removed.id);
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

  async #applyRemoteFolder(state: NoteSyncState, item: DriveItem) {
    if (item.parentId !== state.listId) {
      return;
    }

    const existing = await this.#db.projects.where("remoteId").equals(item.id).first();
    if (existing) {
      await this.#db.projects.put({ ...existing, name: item.name });
      return;
    }

    await this.#db.projects.add({ id: createId(), remoteId: item.id, name: item.name });
  }

  async #applyRemoteFile(state: NoteSyncState, item: DriveItem) {
    if (!item.name.toLowerCase().endsWith(".md")) {
      return;
    }

    const projectId = await this.#resolveProjectId(state, item.parentId);
    if (projectId === undefined) {
      return;
    }

    const content = await drive.downloadFile(this.#graph, item.id);
    const parsed = parseNote(content);
    const remoteRecord = toLocalRecord(item, projectId, parsed.body, parsed.starred);
    const existing = await this.#db.notes.where("remoteId").equals(item.id).first();

    if (!existing) {
      await this.#db.notes.add({ ...remoteRecord, id: createId() });
      return;
    }

    if (item.updatedAt.getTime() >= existing.updatedAt.getTime()) {
      await this.#db.notes.put({ ...remoteRecord, id: existing.id });
    }
  }

  async #resolveProjectId(
    state: NoteSyncState,
    parentId: string | null,
  ): Promise<string | null | undefined> {
    if (parentId === state.listId) {
      return null;
    }

    if (!parentId) {
      return undefined;
    }

    const project = await this.#db.projects.where("remoteId").equals(parentId).first();
    return project ? project.id : undefined;
  }

  async #applyRemoval(id: string) {
    const note = await this.#db.notes.where("remoteId").equals(id).first();
    if (note) {
      await this.#db.notes.delete(note.id);
    }

    const project = await this.#db.projects.where("remoteId").equals(id).first();
    if (project) {
      await this.#db.projects.delete(project.id);
      const projectNotes = await this.#db.notes.where("projectId").equals(project.id).toArray();
      await this.#db.notes.bulkDelete(projectNotes.map((projectNote) => projectNote.id));
    }
  }

  async #push() {
    const dirtyNotes = await this.#db.notes.where("syncStatus").equals("dirty").toArray();

    for (const snapshot of dirtyNotes) {
      try {
        if (snapshot.deletedAt) {
          await this.#pushDelete(snapshot);
        } else if (!snapshot.remoteId) {
          await this.#pushCreate(snapshot);
        } else {
          await this.#pushUpdate(snapshot, snapshot.remoteId);
        }
      } catch (error) {
        // Isolate per-note failures so one bad note doesn't strand the rest of the queue;
        // it stays dirty and is retried on the next sync.
        console.error(`Failed to push note ${snapshot.id}`, error);
      }
    }
  }

  async #pushDelete(snapshot: NoteRecord) {
    if (snapshot.remoteId) {
      await drive.deleteItem(this.#graph, snapshot.remoteId);
    }

    const current = await this.#db.notes.get(snapshot.id);
    if (!current) {
      return;
    }

    if (matchesSnapshot(current, snapshot)) {
      await this.#db.notes.delete(snapshot.id);
    } else if (snapshot.remoteId && current.remoteId === snapshot.remoteId) {
      await this.#db.notes.put({ ...current, remoteId: null, lastSyncedTitle: null });
    }
  }

  async #pushCreate(snapshot: NoteRecord) {
    const created = await drive.uploadFile(
      this.#graph,
      await this.#parentPath(snapshot),
      toFilename(snapshot.title),
      serializeNote(snapshot),
    );
    const current = await this.#db.notes.get(snapshot.id);
    if (!current) {
      return;
    }

    if (matchesSnapshot(current, snapshot)) {
      await this.#db.notes.put(toSyncedLocalRecord(created, snapshot));
    } else {
      await this.#db.notes.put({
        ...current,
        remoteId: created.id,
        lastSyncedTitle: snapshot.title,
      });
    }
  }

  async #pushUpdate(snapshot: NoteRecord, remoteId: string) {
    if (snapshot.title !== snapshot.lastSyncedTitle) {
      await drive.renameItem(this.#graph, remoteId, toFilename(snapshot.title));
    }

    const remote = await drive.uploadFile(
      this.#graph,
      await this.#parentPath(snapshot),
      toFilename(snapshot.title),
      serializeNote(snapshot),
    );

    const current = await this.#db.notes.get(snapshot.id);
    if (current && matchesSnapshot(current, snapshot)) {
      await this.#db.notes.put(toSyncedLocalRecord(remote, snapshot));
    }
  }

  async #parentPath(note: NoteRecord): Promise<string[]> {
    if (!note.projectId) {
      return [];
    }

    const project = await this.#db.projects.get(note.projectId);
    if (!project) {
      throw new Error(`Project not found: ${note.projectId}`);
    }

    return [project.name];
  }
}

const toLocalRecord = (
  item: DriveItem,
  projectId: string | null,
  body: string,
  starred: unknown,
): Omit<NoteRecord, "id"> => {
  const title = item.name.replace(/\.md$/i, "");

  return {
    remoteId: item.id,
    title,
    lastSyncedTitle: title,
    body,
    starred: starred === true ? 1 : 0,
    projectId,
    updatedAt: item.updatedAt,
    syncStatus: "synced",
    deletedAt: null,
  };
};

const toSyncedLocalRecord = (remote: DriveItem, local: NoteRecord): NoteRecord => ({
  ...local,
  remoteId: remote.id,
  lastSyncedTitle: local.title,
  updatedAt: remote.updatedAt,
  syncStatus: "synced",
  deletedAt: null,
});

const serializeNote = (note: NoteRecord) =>
  `---\nstarred: ${note.starred === 1 ? "true" : "false"}\n---\n\n${note.body}`;

const parseNote = (content: string): { body: string; starred: unknown } => {
  const normalized = content.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    return { body: content, starred: undefined };
  }

  const endIndex = normalized.indexOf("\n---", 4);
  if (endIndex < 0) {
    return { body: content, starred: undefined };
  }

  const rawFrontmatter = normalized.slice(4, endIndex);
  const starred = parseStarred(rawFrontmatter);
  if (starred === undefined) {
    return { body: content, starred: undefined };
  }

  let bodyStart = endIndex + 4;
  if (normalized.startsWith("\n\n", bodyStart)) {
    bodyStart += 2;
  } else if (normalized.startsWith("\n", bodyStart)) {
    bodyStart += 1;
  }

  return {
    body: normalized.slice(bodyStart),
    starred,
  };
};

const parseStarred = (frontmatter: string): unknown => {
  for (const line of frontmatter.split("\n")) {
    const match = /^starred:\s*(true|false)\s*$/i.exec(line.trim());
    if (match) {
      return match[1]?.toLowerCase() === "true";
    }
  }

  return undefined;
};

const matchesSnapshot = (current: NoteRecord, snapshot: NoteRecord) =>
  current.updatedAt.getTime() === snapshot.updatedAt.getTime() &&
  current.deletedAt?.getTime() === snapshot.deletedAt?.getTime() &&
  current.syncStatus === snapshot.syncStatus &&
  current.remoteId === snapshot.remoteId;
