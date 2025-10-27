import type { Task } from '../model/tasks';
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
