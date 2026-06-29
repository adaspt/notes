import type { Database } from "@/data/database";
import type { NoteRecord, ProjectRecord } from "@/data/schemas";
import { byModifiedDesc } from "./note-sort";

const isActive = (note: NoteRecord) => note.deletedAt === null;

export const listInboxNotes = async (db: Database) =>
  (await db.notes.filter((note) => note.projectId === null && isActive(note)).toArray()).sort(
    byModifiedDesc,
  );

export const listStarredNotes = async (db: Database) =>
  (await db.notes.where("starred").equals(1).filter(isActive).toArray()).sort(byModifiedDesc);

export const listProjectNotes = async (db: Database, projectId: string) =>
  (await db.notes.where("projectId").equals(projectId).filter(isActive).toArray()).sort(
    byModifiedDesc,
  );

export const listProjects = async (db: Database) =>
  (await db.projects.toArray()).sort(byProjectName);

const byProjectName = (a: ProjectRecord, b: ProjectRecord) => a.name.localeCompare(b.name);
