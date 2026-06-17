import type { LocalNoteRecord, NotesLocalDatabase, PendingNoteWrite } from "@/lib/local-data";

import { GraphApiError, type GraphClient } from "./graph-client";
import {
  deleteDriveItem,
  getOneDriveAppRoot,
  putDriveItemChildContent,
  putDriveItemContent,
} from "./onedrive";

export async function pushPendingNoteWrites(
  client: Pick<GraphClient, "delete" | "get" | "put">,
  database: NotesLocalDatabase,
) {
  const pendingWrites = await database.pendingNoteWrites.orderBy("updatedAt").toArray();
  if (pendingWrites.length === 0) {
    return;
  }

  let appRootDriveItemId: string | null = null;

  for (const pendingWrite of pendingWrites) {
    if (pendingWrite.operation === "delete") {
      await pushPendingNoteDelete(client, database, pendingWrite);
      continue;
    }

    if (!appRootDriveItemId) {
      appRootDriveItemId = (await getOneDriveAppRoot(client)).id;
    }

    const pushedItem = await upsertOneDriveNote(
      client,
      database,
      pendingWrite.note,
      appRootDriveItemId,
    );
    const pushedRemoteUpdatedAt = normalizeGraphDateTime(pushedItem.lastModifiedDateTime);

    await database.transaction("rw", database.notes, database.pendingNoteWrites, async () => {
      const currentNote = await database.notes.get(pendingWrite.noteId);
      if (!currentNote) {
        return;
      }

      await database.notes.put({
        ...currentNote,
        driveItemId: pushedItem.id,
        remoteUpdatedAt: pushedRemoteUpdatedAt,
      });

      if (currentNote.updatedAt === pendingWrite.updatedAt) {
        await database.pendingNoteWrites.delete(pendingWrite.noteId);
        return;
      }

      const latestPendingWrite = await database.pendingNoteWrites.get(pendingWrite.noteId);
      if (
        latestPendingWrite?.operation === "upsert" &&
        latestPendingWrite.note.driveItemId === null
      ) {
        await database.pendingNoteWrites.put({
          ...latestPendingWrite,
          note: {
            ...latestPendingWrite.note,
            driveItemId: pushedItem.id,
            remoteUpdatedAt: pushedRemoteUpdatedAt,
          },
        });
      }
    });
  }
}

async function upsertOneDriveNote(
  client: Pick<GraphClient, "put">,
  database: NotesLocalDatabase,
  note: LocalNoteRecord,
  appRootDriveItemId: string,
) {
  const content = serializeNoteFileContent(note);

  if (note.driveItemId) {
    try {
      return await putDriveItemContent(client, note.driveItemId, content);
    } catch (error) {
      if (!(error instanceof GraphApiError) || error.status !== 404) {
        throw error;
      }
    }
  }

  const parentDriveItemId = await resolveNoteParentDriveItemId(database, note, appRootDriveItemId);
  return putDriveItemChildContent(client, parentDriveItemId, note.name, content);
}

export function serializeNoteFileContent(
  note: Pick<LocalNoteRecord, "content" | "starred" | "type">,
) {
  return `---\ntype: ${note.type}\nstarred: ${note.starred ? "true" : "false"}\n---\n${note.content}`;
}

async function pushPendingNoteDelete(
  client: Pick<GraphClient, "delete">,
  database: NotesLocalDatabase,
  pendingWrite: PendingNoteWrite & { operation: "delete" },
) {
  const currentNote = await database.notes.get(pendingWrite.noteId);
  const driveItemId = pendingWrite.driveItemId ?? currentNote?.driveItemId;

  if (driveItemId) {
    await deleteDriveItem(client, driveItemId);
  }

  await database.transaction("rw", database.notes, database.pendingNoteWrites, async () => {
    const latestPendingWrite = await database.pendingNoteWrites.get(pendingWrite.noteId);
    if (latestPendingWrite?.operation === "delete") {
      await database.notes.delete(pendingWrite.noteId);
      await database.pendingNoteWrites.delete(pendingWrite.noteId);
    }
  });
}

async function resolveNoteParentDriveItemId(
  database: NotesLocalDatabase,
  note: LocalNoteRecord,
  appRootDriveItemId: string,
) {
  if (!note.projectId) {
    return appRootDriveItemId;
  }

  const project = await database.projects.get(note.projectId);
  if (!project) {
    throw new Error("Note project not found.");
  }

  return project.driveItemId;
}

function normalizeGraphDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}
