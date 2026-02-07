import { createContext, createElement, useContext, type ReactNode } from 'react';
import type { Task, TaskStatus } from '@/model/tasks';
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

  getTasksByStatuses(statuses: TaskStatus[]) {
    return this.#db.tasks.where('status').anyOf(statuses).toArray();
  }

  getDirtyTasks() {
    return this.#db.tasks.where('isDirty').equals(1).toArray();
  }

  createTask(task: Task) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export function TasksRepositoryProvider({ value, children }: { value: TasksRepository; children: ReactNode }) {
  return createElement(TasksRepositoryContext.Provider, { value }, children);
}

export function useTasksRepository() {
  const context = useContext(TasksRepositoryContext);
  if (!context) {
    throw new Error('useTasksRepository must be used within a TasksRepositoryProvider');
  }

  return context;
}
