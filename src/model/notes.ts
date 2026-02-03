export type NoteType = 'folder' | 'file';

export interface Note {
  id: number;
  graphId: string | null;
  parentId: number;
  type: NoteType;
  name: string;
  content: string | null;
  createdDateTime: string;
  lastModifiedDateTime: string;
  isDeleted: number;
  isDirty: number;
}

export const folderComparer = (a: Note, b: Note) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
