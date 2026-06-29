import type { Database } from "@/data/database";

const forbiddenFilenameCharacters = /[\\/:*?"<>|]/;

export const normalizeTitle = (title: string) => title.trim().replace(/\.md$/i, "");

export const isValidTitle = (title: string) => {
  const normalized = normalizeTitle(title);
  return (
    normalized.length > 0 &&
    normalized !== "." &&
    normalized !== ".." &&
    !forbiddenFilenameCharacters.test(normalized)
  );
};

export const toFilename = (title: string) => `${normalizeTitle(title)}.md`;

export async function isTitleAvailable(
  db: Database,
  projectId: string | null,
  title: string,
  excludeId?: string,
) {
  const normalized = normalizeTitle(title);
  const notes = await db.notes.filter((note) => note.projectId === projectId).toArray();

  return !notes.some(
    (note) =>
      note.deletedAt === null &&
      note.id !== excludeId &&
      note.title.localeCompare(normalized, undefined, { sensitivity: "accent" }) === 0,
  );
}
