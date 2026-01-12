export interface Note {
  id: number;
  graphId: string | null;
  parentId: number;
  name: string;
  content: string | null;
  createdDateTime: string;
  lastModifiedDateTime: string;
  isDeleted: number;
  isDirty: number;
}
