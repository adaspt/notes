import { mapGraphTaskToTask } from '../model/taskMappings';
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
    // const dirtyTasks = await this.#tasksRepository.getDirtyTasks();
    // for (const task of dirtyTasks) {
    //   if (task.isDeleted) {
    //     if (task.graphId) {
    //       await this.#graphTasksService.deleteTask(task.graphId);
    //     }

    //     this.#tasksRepository.deleteTask(task.id);
    //     continue;
    //   }

    //   if (task.graphId) {
    //     // TODO: const graphTask = await this.#graphTasksService.updateTask(task);
    //     task.isDirty = false;
    //     // TODO: lastModified, eTag
    //     this.#tasksRepository.updateTask(task);
    //     continue;
    //   }

    //   // TODO: const graphTask = await this.#graphTasksService.createTask(task);
    // }

    const graphTasks = await this.#graphTasksService.getTasksDelta();
    for (const graphTask of graphTasks.data) {
      let task = await this.#tasksRepository.getByGraphId(graphTask.id!);
      if ('@removed' in graphTask) {
        if (task) {
          if (graphTask['@removed'].reason === 'deleted') {
            await this.#tasksRepository.deleteTask(task.id);
          } else {
            // TODO: lastModified, eTag, isDeleted
          }
        }
      } else {
        if (!task) {
          task = mapGraphTaskToTask(graphTask);
          await this.#tasksRepository.createTask(task);
        } else {
          task = { ...task };
          await this.#tasksRepository.updateTask(task);
        }
      }
    }

    this.#graphTasksService.saveTasksDeltaLink(graphTasks.deltaLink);
  }
}
