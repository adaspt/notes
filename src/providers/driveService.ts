import { createContext, createElement, useContext, type ReactNode } from 'react';
import type { Client } from '@microsoft/microsoft-graph-client';
import type { DriveItem } from '@microsoft/microsoft-graph-types';

const loadDeltaLink = () => localStorage.getItem('driveDeltaLink');
const saveDeltaLink = (deltaLink: string) => localStorage.setItem('driveDeltaLink', deltaLink);

interface RemovedDriveItem {
  id: string;
  name: string;
  deleted: unknown;
}

const getDrivePage = (graph: Client, url: string) =>
  graph.api(url).get() as Promise<{
    '@odata.nextLink'?: string;
    '@odata.deltaLink'?: string;
    value: Array<RemovedDriveItem | DriveItem>;
  }>;

export class DriveService {
  constructor(graph: Client) {
    this.#graph = graph;
  }

  #graph: Client;

  getAppRoot() {
    return this.#graph.api('/me/drive/special/approot').get() as Promise<DriveItem>;
  }

  async getFilesDelta() {
    const data: Array<RemovedDriveItem | DriveItem> = [];

    let deltaLink = loadDeltaLink() || `/me/drive/special/approot/delta`;
    let nextLink: string | undefined = deltaLink;
    do {
      const page = await getDrivePage(this.#graph, nextLink);
      data.push(...page.value);
      nextLink = page['@odata.nextLink'];
      if (page['@odata.deltaLink']) {
        deltaLink = page['@odata.deltaLink'];
      }
    } while (nextLink);

    return { data, deltaLink };
  }

  saveDriveDeltaLink(deltaLink: string) {
    saveDeltaLink(deltaLink);
  }

  async createFile(parentId: string, name: string, content: string): Promise<DriveItem> {
    const path = `/me/drive/items/${parentId}:/${encodeURIComponent(name)}:/content`;
    return this.#graph.api(path).put(content) as Promise<DriveItem>;
  }

  async createFolder(parentId: string, name: string): Promise<DriveItem> {
    const path = `/me/drive/items/${parentId}/children`;
    const content = { name, folder: {}, '@microsoft.graph.conflictBehavior': 'rename' };
    return this.#graph.api(path).post(content) as Promise<DriveItem>;
  }

  async deleteItem(id: string) {
    await this.#graph.api(`/me/drive/items/${id}`).delete();
  }

  async getContent(id: string): Promise<string | null> {
    const response = await this.#graph.api(`/me/drive/items/${id}/content`).get();
    return await new Response(response).text();
  }

  async updateContent(id: string, content: string) {
    await this.#graph.api(`/me/drive/items/${id}/content`).put(content);
  }
}

const DriveServiceContext = createContext<DriveService | null>(null);

export function DriveServiceProvider({ value, children }: { value: DriveService; children: ReactNode }) {
  return createElement(DriveServiceContext.Provider, { value }, children);
}

export function useDriveService() {
  const context = useContext(DriveServiceContext);
  if (!context) {
    throw new Error('useDriveService must be used within a DriveServiceProvider');
  }

  return context;
}
