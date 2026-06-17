import {
  defaultNoteDeltaCursorId,
  type LocalNoteRecord,
  type LocalProjectRecord,
  type NoteFrontmatter,
  type NoteType,
  type NotesLocalDatabase,
} from "@/lib/local-data";

import { GraphApiError, readPagedGraphCollectionWithDelta, type GraphClient } from "./graph-client";
import { graphDriveItemSchema, type GraphDriveItem } from "./graph-schemas";
import {
  getDriveItemContent,
  getOneDriveAppRoot,
  hasDriveItemName,
  isProjectFolder,
  isSupportedNoteFile,
} from "./onedrive";

type NamedDriveItem = GraphDriveItem & { name: string };

type AppRootDeltaContext = {
  appRootDriveItemId: string;
  appRootName: string | null;
  driveId: string;
};

type NormalizedRemoteNote = Omit<LocalNoteRecord, "driveItemId" | "id" | "updatedAt"> & {
  driveItemId: string;
};

export type NoteDeltaSyncResult = {
  projects: LocalProjectRecord[];
  notes: LocalNoteRecord[];
  changedRemoteItems: number;
  deltaLink: string;
};

export async function syncNotesWithDelta(
  client: Pick<GraphClient, "get" | "getText">,
  database: NotesLocalDatabase,
  updatedAt = new Date().toISOString(),
): Promise<NoteDeltaSyncResult> {
  const appRoot = await getOneDriveAppRoot(client);
  const context = createAppRootDeltaContext(appRoot);
  const cursor = await database.noteDeltaCursors.get(defaultNoteDeltaCursorId);
  const initialDeltaPath = createInitialDeltaPath(context);
  const pathOrUrl =
    cursor?.appRootDriveItemId === context.appRootDriveItemId &&
    cursor.driveId === context.driveId &&
    cursor.deltaLink
      ? cursor.deltaLink
      : initialDeltaPath;
  const { items, deltaLink } = await readNoteDelta(client, pathOrUrl, initialDeltaPath);

  if (!deltaLink) {
    throw new Error("Microsoft Graph did not return a note delta link.");
  }

  const existingProjects = await database.projects.toArray();
  const activeItems = items.filter((item): item is NamedDriveItem => {
    return item.deleted === undefined && hasDriveItemName(item);
  });
  const pathResolver = createPathResolver(context, existingProjects, activeItems);
  const projectChanges = activeItems
    .filter((item) => item.id !== context.appRootDriveItemId)
    .filter(isProjectFolder)
    .map((item) => normalizeProjectDeltaItem(item, pathResolver, updatedAt));
  const noteChanges = await Promise.all(
    activeItems
      .filter(isSupportedNoteFile)
      .map(async (item) => normalizeNoteDeltaItem(client, item, pathResolver, context)),
  );

  await database.transaction(
    "rw",
    database.notes,
    database.projects,
    database.pendingNoteWrites,
    database.noteDeltaCursors,
    async () => {
      for (const item of items) {
        if (item.deleted) {
          await applyRemoteDriveItemDelete(database, item);
        }
      }

      for (const project of projectChanges) {
        await applyRemoteProjectUpsert(database, project);
      }

      for (const note of noteChanges) {
        await applyRemoteNoteUpsert(database, note, updatedAt);
      }

      await database.noteDeltaCursors.put({
        id: defaultNoteDeltaCursorId,
        appRootDriveItemId: context.appRootDriveItemId,
        driveId: context.driveId,
        deltaLink,
        updatedAt,
      });
    },
  );

  return {
    projects: await database.projects.toArray(),
    notes: await database.notes.toArray(),
    changedRemoteItems: items.length,
    deltaLink,
  };
}

async function readNoteDelta(
  client: Pick<GraphClient, "get">,
  pathOrUrl: string,
  fallbackPath: string,
) {
  try {
    return await readPagedGraphCollectionWithDelta(client, pathOrUrl, graphDriveItemSchema);
  } catch (error) {
    if (error instanceof GraphApiError && error.status === 410 && pathOrUrl !== fallbackPath) {
      return readPagedGraphCollectionWithDelta(client, fallbackPath, graphDriveItemSchema);
    }

    throw error;
  }
}

function createAppRootDeltaContext(appRoot: GraphDriveItem): AppRootDeltaContext {
  const driveId = appRoot.parentReference?.driveId;
  if (!driveId) {
    throw new Error("Microsoft Graph did not return an app root drive id.");
  }

  return {
    appRootDriveItemId: appRoot.id,
    appRootName: appRoot.name ?? null,
    driveId,
  };
}

function createInitialDeltaPath(context: AppRootDeltaContext) {
  return `/drives/${encodeURIComponent(context.driveId)}/items/${encodeURIComponent(context.appRootDriveItemId)}/delta?$select=id,name,parentReference,lastModifiedDateTime,file,folder,deleted`;
}

function createPathResolver(
  context: AppRootDeltaContext,
  existingProjects: ReadonlyArray<LocalProjectRecord>,
  activeItems: ReadonlyArray<NamedDriveItem>,
) {
  const activeItemById = new Map(activeItems.map((item) => [item.id, item]));
  const existingProjectByDriveItemId = new Map(
    existingProjects.map((project) => [project.driveItemId, project]),
  );
  const pathCache = new Map<string, string>();

  function getRelativeParentPath(item: GraphDriveItem, visitedIds = new Set<string>()): string {
    const parentId = item.parentReference?.id;
    if (!parentId || parentId === context.appRootDriveItemId) {
      return "";
    }

    if (visitedIds.has(parentId)) {
      return "";
    }

    const activeParent = activeItemById.get(parentId);
    if (activeParent?.folder) {
      return getRelativePath(activeParent, new Set([...visitedIds, parentId]));
    }

    const existingParent = existingProjectByDriveItemId.get(parentId);
    if (existingParent) {
      return existingParent.path;
    }

    return getRelativePathFromParentReference(item.parentReference?.path, context.appRootName);
  }

  function getRelativePath(item: NamedDriveItem, visitedIds = new Set<string>()): string {
    const cachedPath = pathCache.get(item.id);
    if (cachedPath !== undefined) {
      return cachedPath;
    }

    const parentPath = getRelativeParentPath(item, visitedIds);
    const path = joinRelativePath(parentPath, item.name);
    pathCache.set(item.id, path);
    return path;
  }

  return {
    getParentDriveItemId(item: GraphDriveItem) {
      const parentId = item.parentReference?.id;
      if (!parentId || parentId === context.appRootDriveItemId) {
        return null;
      }

      return parentId;
    },
    getRelativePath,
  };
}

function normalizeProjectDeltaItem(
  item: NamedDriveItem,
  pathResolver: ReturnType<typeof createPathResolver>,
  updatedAt: string,
): LocalProjectRecord {
  return {
    id: item.id,
    driveItemId: item.id,
    name: item.name,
    path: pathResolver.getRelativePath(item),
    remoteUpdatedAt: normalizeGraphDateTime(item.lastModifiedDateTime),
    updatedAt,
  };
}

async function normalizeNoteDeltaItem(
  client: Pick<GraphClient, "getText">,
  item: NamedDriveItem,
  pathResolver: ReturnType<typeof createPathResolver>,
  context: AppRootDeltaContext,
): Promise<NormalizedRemoteNote> {
  const rawContent = await getDriveItemContent(client, item.id);
  const parsedContent = parseNoteFileContent(rawContent, inferNoteType(item.name));
  const parentDriveItemId = pathResolver.getParentDriveItemId(item);

  return {
    driveItemId: item.id,
    projectId: parentDriveItemId === context.appRootDriveItemId ? null : parentDriveItemId,
    name: item.name,
    path: pathResolver.getRelativePath(item),
    type: parsedContent.frontmatter.type,
    starred: parsedContent.frontmatter.starred,
    content: parsedContent.content,
    remoteUpdatedAt: normalizeGraphDateTime(item.lastModifiedDateTime),
  };
}

async function applyRemoteDriveItemDelete(database: NotesLocalDatabase, item: GraphDriveItem) {
  const existingNote = await database.notes.where("driveItemId").equals(item.id).first();
  if (existingNote) {
    if (await database.pendingNoteWrites.get(existingNote.id)) {
      return;
    }

    await database.notes.delete(existingNote.id);
  }

  const existingProject = await database.projects.get(item.id);
  if (!existingProject) {
    return;
  }

  const descendantPathPrefix = `${existingProject.path}/`;
  const descendantNotes = await database.notes
    .filter((note) => note.path.startsWith(descendantPathPrefix))
    .toArray();
  for (const note of descendantNotes) {
    if (await database.pendingNoteWrites.get(note.id)) {
      throw new Error("A locally changed note is inside a deleted OneDrive folder.");
    }
  }

  await database.notes.bulkDelete(descendantNotes.map((note) => note.id));
  const descendantProjects = await database.projects
    .filter((project) => project.path.startsWith(descendantPathPrefix))
    .toArray();
  await database.projects.bulkDelete([
    existingProject.id,
    ...descendantProjects.map((project) => project.id),
  ]);
}

async function applyRemoteProjectUpsert(database: NotesLocalDatabase, project: LocalProjectRecord) {
  const existingProject = await database.projects.get(project.id);
  await database.projects.put(project);

  if (!existingProject || existingProject.path === project.path) {
    return;
  }

  await moveDescendantPaths(database, existingProject.path, project.path);
}

async function applyRemoteNoteUpsert(
  database: NotesLocalDatabase,
  note: NormalizedRemoteNote,
  updatedAt: string,
) {
  const existingNote = await database.notes.where("driveItemId").equals(note.driveItemId).first();
  if (existingNote && (await database.pendingNoteWrites.get(existingNote.id))) {
    return;
  }

  const noteId = existingNote?.id ?? note.driveItemId ?? crypto.randomUUID();
  await database.notes.put({
    ...note,
    id: noteId,
    updatedAt,
  });
}

async function moveDescendantPaths(
  database: NotesLocalDatabase,
  previousPath: string,
  nextPath: string,
) {
  const previousPrefix = `${previousPath}/`;
  const projects = await database.projects
    .filter((project) => project.path.startsWith(previousPrefix))
    .toArray();
  const notes = await database.notes
    .filter((note) => note.path.startsWith(previousPrefix))
    .toArray();

  await database.projects.bulkPut(
    projects.map((project) => ({
      ...project,
      path: `${nextPath}/${project.path.slice(previousPrefix.length)}`,
    })),
  );
  await database.notes.bulkPut(
    notes.map((note) => ({
      ...note,
      path: `${nextPath}/${note.path.slice(previousPrefix.length)}`,
    })),
  );
}

function parseNoteFileContent(
  rawContent: string,
  fallbackType: NoteType,
): { content: string; frontmatter: NoteFrontmatter } {
  if (!rawContent.startsWith("---\n")) {
    return {
      content: rawContent,
      frontmatter: {
        starred: false,
        type: fallbackType,
      },
    };
  }

  const closingDelimiterIndex = rawContent.indexOf("\n---\n", 4);
  if (closingDelimiterIndex === -1) {
    return {
      content: rawContent,
      frontmatter: {
        starred: false,
        type: fallbackType,
      },
    };
  }

  const frontmatterText = rawContent.slice(4, closingDelimiterIndex);
  const frontmatter = parseNoteFrontmatter(frontmatterText, fallbackType);

  return {
    content: rawContent.slice(closingDelimiterIndex + "\n---\n".length),
    frontmatter,
  };
}

function parseNoteFrontmatter(frontmatterText: string, fallbackType: NoteType): NoteFrontmatter {
  const values = new Map(
    frontmatterText
      .split("\n")
      .map((line) => line.split(":"))
      .filter((parts) => parts.length >= 2)
      .map(([key, ...valueParts]) => [key.trim(), valueParts.join(":").trim()]),
  );
  const type = values.get("type");

  return {
    type: type === "list" || type === "markdown" ? type : fallbackType,
    starred: values.get("starred") === "true",
  };
}

function inferNoteType(name: string): NoteType {
  return name.endsWith(".list.md") ? "list" : "markdown";
}

function joinRelativePath(parentPath: string, name: string) {
  return parentPath ? `${parentPath}/${name}` : `/${name}`;
}

function getRelativePathFromParentReference(path: string | undefined, appRootName: string | null) {
  if (!path || !appRootName) {
    return "";
  }

  const decodedPath = decodeURIComponent(path);
  const appRootPathMarker = `/${appRootName}`;
  const appRootPathIndex = decodedPath.lastIndexOf(appRootPathMarker);
  if (appRootPathIndex === -1) {
    return "";
  }

  return decodedPath.slice(appRootPathIndex + appRootPathMarker.length);
}

function normalizeGraphDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}
