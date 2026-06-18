import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { CloudSyncContext, type CloudSync, type CloudSyncStatus } from "./cloud-sync-context";
import { useAuthentication } from "@/lib/auth/use-authentication";
import { useBrowserOnline } from "@/hooks/use-browser-online";
import { useBrowserVisible } from "@/hooks/use-browser-visible";
import type { CloudSyncEngine } from "./cloud-sync-engine";
import { liveQuery } from "dexie";
import { localDatabase } from "@/lib/local-data/database";

interface Props {
  syncEngine: CloudSyncEngine;
  children: React.ReactNode;
}

const shouldSyncAfterActivation = (syncEngine: CloudSyncEngine) => {
  const lastSyncedAt = syncEngine.getLastSyncedAt();
  if (!lastSyncedAt) {
    return true;
  }

  return Date.now() - lastSyncedAt.getTime() >= 60_000;
};

function CloudSyncProvider({ syncEngine, children }: Props) {
  const [status, setStatus] = useState<CloudSyncStatus>("idle");
  const auth = useAuthentication();
  const isOnline = useBrowserOnline();
  const isVisible = useBrowserVisible();

  const isSignedIn = auth.status === "signedIn";

  const syncNow = useEffectEvent(async (reason = "Manual") => {
    if (!isSignedIn || !isOnline) {
      return;
    }

    console.log("Synchronizing", reason);
    setStatus("syncing");
    try {
      await syncEngine.sync();
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  });

  useEffect(() => {
    // Sync on startup
    void syncNow("Startup");
  }, []);

  useEffect(() => {
    // Sync on login
    void syncNow("SignIn");
  }, [isSignedIn]);

  useEffect(() => {
    // Sync when app becomes visible
    if (!isVisible || !shouldSyncAfterActivation(syncEngine)) {
      return;
    }

    void syncNow("Visible");
  }, [isVisible, syncEngine]);

  useEffect(() => {
    // Sync when app comes online
    if (!isOnline || !shouldSyncAfterActivation(syncEngine)) {
      return;
    }

    void syncNow("Online");
  }, [isOnline, syncEngine]);

  useEffect(() => {
    // Sync on pending writes
    let lastPendingWriteVersion: string | null = null;

    const syncOnPendingWrites = (pendingWriteVersion: string | null) => {
      if (!pendingWriteVersion || pendingWriteVersion === lastPendingWriteVersion) {
        return;
      }

      lastPendingWriteVersion = pendingWriteVersion;
      void syncNow("PendingWrites");
    };

    const subscription = liveQuery(async () => {
      const [latestTaskWrite, latestNoteWrite] = await Promise.all([
        localDatabase.pendingTaskWrites.orderBy("updatedAt").last(),
        localDatabase.pendingNoteWrites.orderBy("updatedAt").last(),
      ]);
      const latestPendingWrite = [latestTaskWrite?.updatedAt, latestNoteWrite?.updatedAt]
        .filter((updatedAt): updatedAt is string => updatedAt !== undefined)
        .sort()
        .at(-1);

      return latestPendingWrite ?? null;
    }).subscribe({
      error: (error) => console.error("Pending writes subscription error", error),
      next: syncOnPendingWrites,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const sync = useMemo<CloudSync>(() => ({ status, syncNow }), [status]);

  return <CloudSyncContext.Provider value={sync}>{children}</CloudSyncContext.Provider>;
}

export default CloudSyncProvider;
