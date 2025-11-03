export interface Note {
  id: number;
  graphId: string | null;
  parentId: number | null;
  name: string;
  content: string | null;
  createdDateTime: string;
  lastModifiedDateTime: string;
  isDeleted: boolean;
  isDirty: boolean;
}
