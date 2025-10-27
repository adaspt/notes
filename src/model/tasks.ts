export type TaskImportance = 'low' | 'normal' | 'high';

export type TaskStatus = 'notStarted' | 'inProgress' | 'completed' | 'waitingOnOthers' | 'deferred';

export interface TaskCheckListItem {
  graphId: string;
  displayName: string;
  isChecked: boolean;
}

export interface Task {
  id: number;
  graphId: string | null;
  title: string;
  importance: TaskImportance;
  status: TaskStatus;
  startDateTime: string | null;
  dueDateTime: string | null;
  completedDateTime: string | null;
  createdDateTime: string;
  lastModifiedDateTime: string;
  body: string | null;
  checkListItems: TaskCheckListItem[];
  isDeleted: boolean;
  isDirty: boolean;
}
