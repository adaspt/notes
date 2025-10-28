import type { Client } from '@microsoft/microsoft-graph-client';
import type { TodoTask } from '@microsoft/microsoft-graph-types';

const DEFAULT_LIST_ID =
  'AQMkADAwATZiZmYAZC04ZDNkLTYyNTEtMDACLTAwCgAuAAADr1YfNi4PxUK5pRxD5quqYgEAth3o9eXMsEavt5EylVZjnAAAAgESAAAA';

const loadDeltaLink = () => localStorage.getItem('tasksDeltaLink');
const saveDeltaLink = (deltaLink: string) => localStorage.setItem('tasksDeltaLink', deltaLink);

interface RemovedTodoTask {
  id: string;
  '@removed': { reason: 'changed' | 'deleted' };
}

const getTasksPage = (graph: Client, url: string) =>
  graph.api(url).get() as Promise<{
    '@odata.nextLink'?: string;
    '@odata.deltaLink'?: string;
    value: Array<RemovedTodoTask | TodoTask>;
  }>;

export class GraphTasksService {
  constructor(graph: Client) {
    this.#graph = graph;
  }

  #graph: Client;

  async getTasksDelta() {
    const data: Array<RemovedTodoTask | TodoTask> = [];

    let deltaLink = loadDeltaLink() || `/me/todo/lists/${DEFAULT_LIST_ID}/tasks/delta`;
    let nextLink: string | undefined = deltaLink;
    do {
      const page = await getTasksPage(this.#graph, nextLink);
      data.push(...page.value);
      nextLink = page['@odata.nextLink'];
      if (page['@odata.deltaLink']) {
        deltaLink = page['@odata.deltaLink'];
      }
    } while (nextLink);

    return { data, deltaLink };
  }

  saveTasksDeltaLink(deltaLink: string) {
    saveDeltaLink(deltaLink);
  }

  createTask(task: TodoTask): Promise<TodoTask> {
    return this.#graph.api(`/me/todo/lists/${DEFAULT_LIST_ID}/tasks`).post(task);
  }

  updateTask(task: TodoTask): Promise<TodoTask> {
    return this.#graph.api(`/me/todo/lists/${DEFAULT_LIST_ID}/tasks/${task.id}`).update(task);
  }

  deleteTask(taskId: string): Promise<void> {
    return this.#graph.api(`/me/todo/lists/${DEFAULT_LIST_ID}/tasks/${taskId}`).delete();
  }
}
