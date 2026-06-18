import { createGraphClient } from "@/lib/microsoft/graph-client";
import { loadInitialMicrosoftData } from "@/lib/microsoft/initial-load";
import type { IPublicClientApplication } from "@azure/msal-browser";

export class CloudSyncEngine {
  constructor(msal: IPublicClientApplication, scopes: string[]) {
    this.#msal = msal;
    this.#scopes = scopes;
  }

  #msal: IPublicClientApplication;
  #scopes: string[];
  #current: Promise<void> | null = null;
  #dirty = false;
  #lastSyncedAt: Date | null = null;

  getLastSyncedAt() {
    return this.#lastSyncedAt;
  }

  async sync() {
    if (this.#current) {
      this.#dirty = true;
      await this.#current;
      return;
    }

    this.#current = this.#runSyncLoop();
    try {
      await this.#current;
    } finally {
      this.#current = null;
    }
  }

  async #runSyncLoop() {
    do {
      this.#dirty = false;
      try {
        await this.#runSync();
        this.#lastSyncedAt = new Date();
      } catch (error) {
        console.error("Sync error", error);
      }
    } while (this.#dirty);
  }

  async #runSync() {
    console.log("CloudSyncEngine", "running", new Date().toLocaleTimeString());
    const tokenResult = await this.#msal.acquireTokenSilent({
      account: this.#msal.getActiveAccount() || undefined,
      scopes: this.#scopes,
    });
    await loadInitialMicrosoftData(createGraphClient(tokenResult.accessToken));
    console.log("CloudSyncEngine", "finished", new Date().toLocaleTimeString());
  }
}
