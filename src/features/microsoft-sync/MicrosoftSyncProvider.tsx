import type { AccountInfo, PublicClientApplication } from "@azure/msal-browser";
import { liveQuery } from "dexie";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { globalSyncStateId, localDatabase, type SyncStateRecord } from "@/lib/local-data";

import { MicrosoftSyncContext, type MicrosoftSyncStatus } from "./microsoft-sync-context";
import { markOffline, markSyncFailed, markSyncing } from "./sync-state";

type MicrosoftSyncProviderProps = {
  children: ReactNode;
};

const pendingWriteSyncDebounceMs = 30_000;
const periodicSyncIntervalMs = 60 * 60 * 1_000;
const visibleSyncMinAgeMs = 60_000;

function MicrosoftSyncProvider({ children }: MicrosoftSyncProviderProps) {
  const [client, setClient] = useState<PublicClientApplication | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(getBrowserOnlineStatus);
  const [networkSyncRequest, setNetworkSyncRequest] = useState(0);
  const [pendingWriteVersion, setPendingWriteVersion] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncStateRecord | null>(null);
  const startupSyncAccountIdRef = useRef<string | null>(null);
  const syncPromiseRef = useRef<Promise<void> | null>(null);
  const syncRequestedAfterCurrentRef = useRef(false);

  useEffect(() => {
    const subscription = liveQuery(async () =>
      localDatabase.syncStates.get(globalSyncStateId),
    ).subscribe({
      error: (error) => {
        setMessage(getErrorMessage(error));
      },
      next: (nextSyncState) => {
        setSyncState(nextSyncState ?? null);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
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
      error: (error) => {
        setMessage(getErrorMessage(error));
      },
      next: setPendingWriteVersion,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setNetworkSyncRequest((request) => request + 1);
    }

    function handleOffline() {
      setIsOnline(false);
      void markOffline(localDatabase);
    }

    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    if (!getBrowserOnlineStatus()) {
      void markOffline(localDatabase);
    }

    return () => {
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeClient() {
      try {
        const { initializeMicrosoftAuthSession } = await import("@/lib/microsoft");
        const session = await initializeMicrosoftAuthSession();

        if (!session) {
          if (isMounted) {
            setIsInitialized(true);
            setMessage("Microsoft client ID is not configured.");
          }
          return;
        }

        if (!isMounted) {
          return;
        }

        setAccount(session.account);
        setClient(session.client);
        setIsInitialized(true);
        setMessage(
          session.account
            ? null
            : `No Microsoft account is cached. Cached accounts: ${session.accountCount}. Redirect response handled: ${session.redirectHandled ? "yes" : "no"}.`,
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setIsInitialized(true);
        setMessage(getErrorMessage(error));
      }
    }

    void initializeClient();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async () => {
    if (!client) {
      setMessage("Microsoft client ID is not configured.");
      return;
    }

    setMessage(null);

    try {
      const { signInWithMicrosoft } = await import("@/lib/microsoft");
      await signInWithMicrosoft(client);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }, [client]);

  const syncNow = useCallback(async () => {
    if (!client || !account) {
      return;
    }

    if (!isOnline) {
      await markOffline(localDatabase);
      setMessage("Offline. Sync will resume when the network returns.");
      return;
    }

    if (syncPromiseRef.current) {
      syncRequestedAfterCurrentRef.current = true;
      await syncPromiseRef.current;
      return;
    }

    const syncPromise = runMicrosoftSyncLoop(
      client,
      account,
      setMessage,
      syncRequestedAfterCurrentRef,
    );

    syncPromiseRef.current = syncPromise;
    try {
      await syncPromise;
    } finally {
      syncPromiseRef.current = null;
    }
  }, [account, client, isOnline]);

  useEffect(() => {
    if (!isInitialized || !client || !account) {
      return;
    }

    if (!isOnline) {
      void markOffline(localDatabase);
      return;
    }

    const accountId = getAccountId(account);
    if (startupSyncAccountIdRef.current === accountId) {
      return;
    }

    startupSyncAccountIdRef.current = accountId;
    void syncNow();
  }, [account, client, isInitialized, isOnline, syncNow]);

  useEffect(() => {
    if (!isInitialized || !client || !account || !isOnline || networkSyncRequest === 0) {
      return;
    }

    void syncNow();
  }, [account, client, isInitialized, isOnline, networkSyncRequest, syncNow]);

  useEffect(() => {
    if (!isInitialized || !client || !account || !isOnline || !pendingWriteVersion) {
      return;
    }

    const syncTimer = globalThis.setTimeout(() => {
      void syncNow();
    }, pendingWriteSyncDebounceMs);

    return () => {
      globalThis.clearTimeout(syncTimer);
    };
  }, [account, client, isInitialized, isOnline, pendingWriteVersion, syncNow]);

  useEffect(() => {
    if (!isInitialized || !client || !account || !isOnline) {
      return;
    }

    const syncInterval = globalThis.setInterval(() => {
      void syncNow();
    }, periodicSyncIntervalMs);

    return () => {
      globalThis.clearInterval(syncInterval);
    };
  }, [account, client, isInitialized, isOnline, syncNow]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (
        globalThis.document.visibilityState !== "visible" ||
        !isInitialized ||
        !client ||
        !account ||
        !isOnline ||
        !shouldSyncAfterVisible(syncState)
      ) {
        return;
      }

      void syncNow();
    }

    globalThis.document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      globalThis.document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [account, client, isInitialized, isOnline, syncNow, syncState]);

  const status = useMemo(
    () => getMicrosoftSyncStatus({ account, client, isInitialized, isOnline, syncState }),
    [account, client, isInitialized, isOnline, syncState],
  );

  const displayMessage = message ?? syncState?.message ?? null;

  const value = useMemo(
    () => ({
      account,
      isOnline,
      message: displayMessage,
      status,
      signIn,
      syncNow,
    }),
    [account, displayMessage, isOnline, signIn, status, syncNow],
  );

  return (
    <MicrosoftSyncContext value={value}>
      {isInitialized ? children : <MicrosoftStartupScreen />}
    </MicrosoftSyncContext>
  );
}

async function runMicrosoftSync(
  client: PublicClientApplication,
  account: AccountInfo,
  setMessage: (message: string | null) => void,
) {
  setMessage(null);
  await markSyncing(localDatabase);

  try {
    const { acquireMicrosoftGraphToken, createGraphClient, loadInitialMicrosoftData } =
      await import("@/lib/microsoft");
    const accessToken = await acquireMicrosoftGraphToken(client, account);
    await loadInitialMicrosoftData(createGraphClient(accessToken));
    setMessage(null);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    await markSyncFailed(localDatabase, errorMessage);
    setMessage(errorMessage);
  }
}

async function runMicrosoftSyncLoop(
  client: PublicClientApplication,
  account: AccountInfo,
  setMessage: (message: string | null) => void,
  syncRequestedAfterCurrentRef: { current: boolean },
) {
  do {
    syncRequestedAfterCurrentRef.current = false;
    await runMicrosoftSync(client, account, setMessage);
  } while (syncRequestedAfterCurrentRef.current);
}

function getMicrosoftSyncStatus({
  account,
  client,
  isInitialized,
  isOnline,
  syncState,
}: {
  account: AccountInfo | null;
  client: PublicClientApplication | null;
  isInitialized: boolean;
  isOnline: boolean;
  syncState: SyncStateRecord | null;
}): MicrosoftSyncStatus {
  if (!isInitialized) {
    return "initializing";
  }

  if (!client) {
    return "missingConfig";
  }

  if (!account) {
    return "signedOut";
  }

  if (!isOnline) {
    return syncState?.status === "offlineChanges" ? "offlineChanges" : "offline";
  }

  return syncState?.status ?? "syncing";
}

function getAccountId(account: AccountInfo) {
  return account.homeAccountId || account.localAccountId || account.username;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Microsoft sync failed.";
}

function getBrowserOnlineStatus() {
  return globalThis.navigator?.onLine ?? true;
}

function shouldSyncAfterVisible(syncState: SyncStateRecord | null) {
  if (!syncState?.lastSyncedAt) {
    return true;
  }

  const lastSyncedAt = new Date(syncState.lastSyncedAt).getTime();
  return Date.now() - lastSyncedAt >= visibleSyncMinAgeMs;
}

function MicrosoftStartupScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
      Connecting to Microsoft...
    </main>
  );
}

export default MicrosoftSyncProvider;
