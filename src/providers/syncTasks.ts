import { createTaskFromGraphTask, updateTaskFromGraphTask } from '../model/taskMappings';
import type { GraphTasksService } from './graphTasks';
import type { TasksRepository } from './tasksRepository';

export class SyncTasksService {
  constructor(tasksRepository: TasksRepository, graphTasksService: GraphTasksService) {
    this.#tasksRepository = tasksRepository;
    this.#graphTasksService = graphTasksService;
  }

  #tasksRepository: TasksRepository;
  #graphTasksService: GraphTasksService;

  #syncOperation: Promise<void> | null = null;

  sync() {
    if (this.#syncOperation) {
      return this.#syncOperation;
    }

    this.#syncOperation = this.#syncTasks().finally(() => {
      this.#syncOperation = null;
    });

    return this.#syncOperation;
  }

  async #syncTasks() {
    await this.#pushLocalChanges();
    await this.#pullChangesFromRemote();
  }

  async #pushLocalChanges() {
    const dirtyTasks = await this.#tasksRepository.getDirtyTasks();
    for (const task of dirtyTasks) {
      if (task.isDeleted) {
        if (task.graphId) {
          await this.#graphTasksService.deleteTask(task.graphId);
        }

        await this.#tasksRepository.deleteTask(task.id);
        continue;
      }

      if (task.graphId) {
        const graphTask = await this.#graphTasksService.updateTask({
          id: task.graphId,
          title: task.title,
          importance: task.importance,
          status: task.status,
          startDateTime: task.startDateTime ? { dateTime: task.startDateTime, timeZone: 'UTC' } : undefined,
          dueDateTime: task.dueDateTime ? { dateTime: task.dueDateTime, timeZone: 'UTC' } : undefined,
          completedDateTime: task.completedDateTime ? { dateTime: task.completedDateTime, timeZone: 'UTC' } : undefined,
          createdDateTime: task.createdDateTime,
          lastModifiedDateTime: task.lastModifiedDateTime,
          body: task.body ? { content: task.body, contentType: 'text' } : undefined,
          checklistItems: task.checkListItems
        });

        this.#tasksRepository.updateTask(updateTaskFromGraphTask(task, graphTask));
        continue;
      }

      const graphTask = await this.#graphTasksService.createTask({
        title: task.title,
        importance: task.importance,
        status: task.status,
        startDateTime: task.startDateTime ? { dateTime: task.startDateTime, timeZone: 'UTC' } : undefined,
        dueDateTime: task.dueDateTime ? { dateTime: task.dueDateTime, timeZone: 'UTC' } : undefined,
        completedDateTime: task.completedDateTime ? { dateTime: task.completedDateTime, timeZone: 'UTC' } : undefined,
        createdDateTime: task.createdDateTime,
        lastModifiedDateTime: task.lastModifiedDateTime,
        body: task.body ? { content: task.body, contentType: 'text' } : undefined,
        checklistItems: task.checkListItems
      });

      this.#tasksRepository.updateTask(updateTaskFromGraphTask(task, graphTask));
    }
  }

  async #pullChangesFromRemote() {
    const graphTasks = await this.#graphTasksService.getTasksDelta();
    for (const graphTask of graphTasks.data) {
      const task = await this.#tasksRepository.getByGraphId(graphTask.id!);
      if ('@removed' in graphTask) {
        if (task) {
          if (graphTask['@removed'].reason === 'deleted') {
            await this.#tasksRepository.deleteTask(task.id);
          } else {
            task.isDeleted = true;
            await this.#tasksRepository.updateTask(task);
          }
        }
      } else {
        if (!task) {
          await this.#tasksRepository.createTask(createTaskFromGraphTask(graphTask));
        } else {
          await this.#tasksRepository.updateTask(updateTaskFromGraphTask(task, graphTask));
        }
      }
    }

    this.#graphTasksService.saveTasksDeltaLink(graphTasks.deltaLink);
  }
}
