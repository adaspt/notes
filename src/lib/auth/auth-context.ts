import type { AccountInfo } from "@azure/msal-browser";
import { createContext } from "react";

export type AuthStatus = "initializing" | "signedOut" | "signedIn";

export type Auth = {
  account: AccountInfo | null;
  status: AuthStatus;
  signIn: () => Promise<void>;
};

export const AuthContext = createContext<Auth | null>(null);
