import type { TodoTask } from '@microsoft/microsoft-graph-types';

export type TaskImportance = 'low' | 'normal' | 'high';

export type TaskStatus = 'notStarted' | 'inProgress' | 'completed' | 'waitingOnOthers' | 'deferred';

export interface TaskCheckListItem {
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
  isDeleted: number;
  isDirty: number;
}

export function updateTaskFromGraphTask(task: Partial<Task>, graphTask: TodoTask): Task {
  return {
    id: 0,
    ...task,
    graphId: graphTask.id!,
    title: graphTask.title!,
    importance: graphTask.importance || 'normal',
    status: graphTask.status || 'notStarted',
    startDateTime: graphTask.startDateTime?.dateTime || null,
    dueDateTime: graphTask.dueDateTime?.dateTime || null,
    completedDateTime: graphTask.completedDateTime?.dateTime || null,
    createdDateTime: graphTask.createdDateTime!,
    lastModifiedDateTime: graphTask.lastModifiedDateTime!,
    body: graphTask.body?.content || null,
    checkListItems: (graphTask.checklistItems || []).map((item) => ({
      graphId: item.id!,
      displayName: item.displayName!,
      isChecked: item.isChecked || false
    })),
    isDeleted: 0,
    isDirty: 0
  };
}
