import {
  localDatabase,
  type LocalNoteRecord,
  type LocalProjectRecord,
  type NotesLocalDatabase,
} from "@/lib/local-data";

type NoteMutationOptions = {
  database?: NotesLocalDatabase;
  now?: Date;
};

export type NoteCreateValues = {
  name: string;
  projectId?: string | null;
};

export async function createNote(values: NoteCreateValues, options: NoteMutationOptions = {}) {
  const database = options.database ?? localDatabase;
  const now = options.now ?? new Date();
  const updatedAt = now.toISOString();
  const noteId = crypto.randomUUID();
  const name = createMarkdownNoteFileName(values.name);
  const projectId = values.projectId ?? null;

  return database.transaction(
    "rw",
    database.notes,
    database.pendingNoteWrites,
    database.projects,
    async () => {
      const project = projectId ? await getRequiredProject(database, projectId) : null;
      const path = createNotePath(name, project);

      if (await database.notes.where("path").equals(path).first()) {
        throw new Error("A note with that name already exists.");
      }

      const note: LocalNoteRecord = {
        id: noteId,
        driveItemId: null,
        projectId,
        name,
        path,
        type: "markdown",
        starred: false,
        content: "",
        remoteUpdatedAt: null,
        updatedAt,
      };

      await database.notes.put(note);
      await database.pendingNoteWrites.put({
        noteId,
        operation: "upsert",
        note,
        updatedAt,
      });

      return note;
    },
  );
}

export async function editNoteContent(
  noteId: string,
  content: string,
  options: NoteMutationOptions = {},
) {
  const database = options.database ?? localDatabase;
  const now = options.now ?? new Date();
  const updatedAt = now.toISOString();

  return database.transaction("rw", database.notes, database.pendingNoteWrites, async () => {
    const note = await database.notes.get(noteId);
    if (!note) {
      throw new Error("Note not found.");
    }

    const updatedNote: LocalNoteRecord = {
      ...note,
      content,
      updatedAt,
    };

    await database.notes.put(updatedNote);
    await database.pendingNoteWrites.put({
      noteId,
      operation: "upsert",
      note: updatedNote,
      updatedAt,
    });

    return updatedNote;
  });
}

export async function setNoteStarred(
  noteId: string,
  starred: boolean,
  options: NoteMutationOptions = {},
) {
  const database = options.database ?? localDatabase;
  const now = options.now ?? new Date();
  const updatedAt = now.toISOString();

  return database.transaction("rw", database.notes, database.pendingNoteWrites, async () => {
    const note = await database.notes.get(noteId);
    if (!note) {
      throw new Error("Note not found.");
    }

    const updatedNote: LocalNoteRecord = {
      ...note,
      starred,
      updatedAt,
    };

    await database.notes.put(updatedNote);
    await database.pendingNoteWrites.put({
      noteId,
      operation: "upsert",
      note: updatedNote,
      updatedAt,
    });

    return updatedNote;
  });
}

export async function deleteNote(noteId: string, options: NoteMutationOptions = {}) {
  const database = options.database ?? localDatabase;
  const now = options.now ?? new Date();
  const updatedAt = now.toISOString();

  return database.transaction("rw", database.notes, database.pendingNoteWrites, async () => {
    const note = await database.notes.get(noteId);
    if (!note) {
      throw new Error("Note not found.");
    }

    await database.notes.delete(noteId);
    await database.pendingNoteWrites.put({
      noteId,
      operation: "delete",
      driveItemId: note.driveItemId,
      note: null,
      updatedAt,
    });
  });
}

function createMarkdownNoteFileName(input: string) {
  const baseName = input.trim();

  if (!baseName) {
    throw new Error("Note name is required.");
  }

  if (baseName.toLowerCase().endsWith(".md")) {
    throw new Error("Enter the note name without an extension.");
  }

  if (/[<>:"/\\|?*]/u.test(baseName) || containsControlCharacter(baseName)) {
    throw new Error("Note name contains characters OneDrive cannot use.");
  }

  if (baseName === "." || baseName === "..") {
    throw new Error("Note name is not valid.");
  }

  return `${baseName}.md`;
}

function containsControlCharacter(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    if (value.charCodeAt(index) <= 0x1f) {
      return true;
    }
  }

  return false;
}

async function getRequiredProject(database: NotesLocalDatabase, projectId: string) {
  const project = await database.projects.get(projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  return project;
}

function createNotePath(name: string, project: LocalProjectRecord | null) {
  if (!project) {
    return `/${name}`;
  }

  return `${project.path}/${name}`;
}
