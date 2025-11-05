import type { TodoTask } from '@microsoft/microsoft-graph-types';
import type { Task } from './tasks';

export function createTaskFromGraphTask(graphTask: TodoTask): Task {
  return {
    id: 0,
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
      displayName: item.displayName!,
      isChecked: item.isChecked || false
    })),
    isDeleted: false,
    isDirty: 0
  };
}

export function updateTaskFromGraphTask(task: Task, graphTask: TodoTask): Task {
  return {
    ...task,
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
    isDeleted: false,
    isDirty: 0
  };
}
