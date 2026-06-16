import { useContext } from "react";

import { MicrosoftSyncContext } from "./microsoft-sync-context";

export function useMicrosoftSync() {
  const context = useContext(MicrosoftSyncContext);

  if (!context) {
    throw new Error("useMicrosoftSync must be used inside MicrosoftSyncProvider.");
  }

  return context;
}
