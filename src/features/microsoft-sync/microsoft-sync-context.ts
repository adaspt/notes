import type { AccountInfo } from "@azure/msal-browser";
import type { SyncStatus } from "@/lib/local-data";
import { createContext } from "react";

export type MicrosoftSyncStatus = "initializing" | "missingConfig" | "signedOut" | SyncStatus;

export type MicrosoftSyncContextValue = {
  account: AccountInfo | null;
  isOnline: boolean;
  message: string | null;
  status: MicrosoftSyncStatus;
  signIn: () => Promise<void>;
  syncNow: () => Promise<void>;
};

export const MicrosoftSyncContext = createContext<MicrosoftSyncContextValue | null>(null);
