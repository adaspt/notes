import { useEffect, useMemo, type ReactNode } from "react";
import { useSession } from "@/features/auth/use-session";
import { type SyncClient, SyncContext } from "./sync-context";
import SyncShortcut from "./sync-shortcut";
import type { Sync } from "./sync";

interface Props {
  sync: Sync;
  children?: ReactNode;
}

function SyncProvider({ sync, children }: Props) {
  const session = useSession();

  useEffect(() => {
    if (session.status !== "signedIn") {
      return;
    }

    return sync.initialize();
  }, [session.status, sync]);

  const client = useMemo<SyncClient>(
    () => ({
      syncNow: () => sync.syncNow(),
      subscribe: (fn) => sync.subscribe(fn),
    }),
    [sync],
  );

  return (
    <SyncContext.Provider value={client}>
      <SyncShortcut />
      {children}
    </SyncContext.Provider>
  );
}

export default SyncProvider;
