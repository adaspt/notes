import { createContext } from "react";

export type AuthStatus = "initializing" | "signedIn" | "signedOut";

export interface SessionClient {
  status: AuthStatus;
  signIn: () => Promise<void>;
  getToken: () => Promise<string>;
}

export const SessionContext = createContext<SessionClient | null>(null);
