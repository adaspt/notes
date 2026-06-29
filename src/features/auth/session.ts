import { InteractionRequiredAuthError, type IPublicClientApplication } from "@azure/msal-browser";
import type { AuthStatus } from "./session-context";

/**
 * Thrown when a token can't be acquired silently while the device is offline.
 * Callers (e.g. sync) should treat this as a transient, expected failure and retry
 * later rather than triggering an interactive redirect that would unload the app.
 */
export class AuthDeferredError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AuthDeferredError";
  }
}

export class Session {
  constructor(msal: IPublicClientApplication, scopes: string[]) {
    this.#msal = msal;
    this.#scopes = scopes;
  }

  #initialized = false;

  #msal: IPublicClientApplication;
  #scopes: string[];
  #status: AuthStatus = "initializing";
  #subscribers: Array<() => void> = [];

  getStatus() {
    return this.#status;
  }

  async initialize() {
    if (this.#initialized) {
      return;
    }

    this.#initialized = true;

    try {
      const result = await this.#msal.handleRedirectPromise();
      if (result) {
        this.#msal.setActiveAccount(result.account);
      }
    } catch (error) {
      console.error(error);
    }

    if (!this.#msal.getActiveAccount()) {
      const accounts = this.#msal.getAllAccounts();
      if (accounts.length > 0) {
        this.#msal.setActiveAccount(accounts[0]);
      }
    }

    this.#status = this.#msal.getActiveAccount() ? "signedIn" : "signedOut";
    this.#subscribers.forEach((subscriber) => subscriber());
  }

  async signIn() {
    await this.#msal.loginRedirect({ scopes: this.#scopes });
  }

  async getToken() {
    try {
      const result = await this.#msal.acquireTokenSilent({ scopes: this.#scopes });
      return result.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        if (!navigator.onLine) {
          // Offline: don't navigate away — let the caller back off and retry on reconnect.
          throw new AuthDeferredError("Token unavailable offline", { cause: error });
        }
        await this.#msal.acquireTokenRedirect({ scopes: this.#scopes });
        throw new Error("Token acquisition redirected", { cause: error });
      }

      throw error;
    }
  }

  subscribe(subscriber: () => void) {
    this.#subscribers.push(subscriber);
    return () => {
      const index = this.#subscribers.indexOf(subscriber);
      if (index >= 0) {
        this.#subscribers.splice(index, 1);
      }
    };
  }
}
