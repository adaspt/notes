import type { LocalNoteRecord } from "@/lib/local-data";

export type NoteListItem = {
  id: string;
  title: string;
  activityLabel: string;
  statusLabel: string;
};

export type NoteDetail = {
  id: string;
  title: string;
  activityLabel: string;
  content: string;
  starred: boolean;
  statusLabel: string;
  type: LocalNoteRecord["type"];
};

export function getInboxNoteListItems(notes: ReadonlyArray<LocalNoteRecord>) {
  return notes
    .filter((note) => note.projectId === null)
    .sort(compareNotes)
    .map(toNoteListItem);
}

export function getStarredNoteListItems(notes: ReadonlyArray<LocalNoteRecord>) {
  return notes
    .filter((note) => note.starred)
    .sort(compareNotes)
    .map(toNoteListItem);
}

export function getProjectNoteListItems(notes: ReadonlyArray<LocalNoteRecord>, projectId: string) {
  return notes
    .filter((note) => note.projectId === projectId)
    .sort(compareNotes)
    .map(toNoteListItem);
}

export function toNoteDetail(note: LocalNoteRecord): NoteDetail {
  return {
    id: note.id,
    title: formatNoteTitle(note.name),
    activityLabel: formatNoteActivity(note.remoteUpdatedAt ?? note.updatedAt),
    content: note.content,
    starred: note.starred,
    statusLabel: formatNoteStatus(note),
    type: note.type,
  };
}

function toNoteListItem(note: LocalNoteRecord): NoteListItem {
  return {
    id: note.id,
    title: formatNoteTitle(note.name),
    activityLabel: formatNoteActivity(note.remoteUpdatedAt ?? note.updatedAt),
    statusLabel: formatNoteStatus(note),
  };
}

function compareNotes(firstNote: LocalNoteRecord, secondNote: LocalNoteRecord) {
  const firstUpdatedAt = firstNote.remoteUpdatedAt ?? firstNote.updatedAt;
  const secondUpdatedAt = secondNote.remoteUpdatedAt ?? secondNote.updatedAt;
  const updatedComparison = secondUpdatedAt.localeCompare(firstUpdatedAt);
  if (updatedComparison !== 0) {
    return updatedComparison;
  }

  const titleComparison = formatNoteTitle(firstNote.name).localeCompare(
    formatNoteTitle(secondNote.name),
  );
  if (titleComparison !== 0) {
    return titleComparison;
  }

  return firstNote.id.localeCompare(secondNote.id);
}

function formatNoteTitle(name: string) {
  return name.replace(/\.list\.md$/, "").replace(/\.md$/, "");
}

function formatNoteStatus(note: LocalNoteRecord) {
  if (note.starred) {
    return "Starred";
  }

  return note.type === "list" ? "List" : "Normal";
}

function formatNoteActivity(updatedAt: string) {
  return `Updated ${formatMonthDay(updatedAt.slice(0, 10))}`;
}

function formatMonthDay(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${month}/${day}`;
}
