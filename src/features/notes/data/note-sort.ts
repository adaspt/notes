import type { NoteRecord } from "@/data/schemas";

export const byModifiedDesc = (a: NoteRecord, b: NoteRecord) =>
  b.updatedAt.getTime() - a.updatedAt.getTime() || a.title.localeCompare(b.title);
