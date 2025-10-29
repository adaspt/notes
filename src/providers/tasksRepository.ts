import { createContext, useContext } from 'react';
import type { Task, TaskStatus } from '../model/tasks';
import type { Db } from './db';

export class TasksRepository {
  constructor(db: Db) {
    this.#db = db;
  }

  #db: Db;

  getById(id: number) {
    return this.#db.tasks.get(id);
  }

  getByGraphId(graphId: string) {
    return this.#db.tasks.where('graphId').equals(graphId).first();
  }

  getDirtyTasks() {
    return this.#db.tasks.where('isDirty').equals(1).toArray();
  }

  async getTodayTasks() {
    const excludedStatuses: TaskStatus[] = ['completed', 'deferred'];
    const tasks = await this.#db.tasks.where('status').noneOf(excludedStatuses).toArray();
    return tasks
      .filter((x) => !x.startDateTime || new Date(x.startDateTime).getTime() >= Date.now())
      .toSorted((a, b) => {
        if (a.importance !== b.importance) {
          if (a.importance === 'high') return -1;
          if (b.importance === 'high') return 1;
          if (a.importance === 'normal') return -1;
          return 1;
        }

        return new Date(a.createdDateTime).getTime() - new Date(b.createdDateTime).getTime();
      });
  }

  createTask(task: Task) {
    const { id, ...rest } = task;
    return this.#db.tasks.add(rest);
  }

  updateTask(task: Task) {
    return this.#db.tasks.put(task);
  }

  deleteTask(id: number) {
    return this.#db.tasks.delete(id);
  }
}

const TasksRepositoryContext = createContext<TasksRepository | null>(null);

export const TasksRepositoryProvider = TasksRepositoryContext.Provider;

export function useTasksRepository() {
  const context = useContext(TasksRepositoryContext);
  if (!context) {
    throw new Error('useTasksRepository must be used within a TasksRepositoryProvider');
  }

  return context;
}
