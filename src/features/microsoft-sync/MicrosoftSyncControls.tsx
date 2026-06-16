import { LogIn, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

import { useMicrosoftSync } from "./use-microsoft-sync";

function MicrosoftSyncControls() {
  const { account, isOnline, message, status, signIn, syncNow } = useMicrosoftSync();
  const isBusy = status === "initializing" || status === "syncing";
  const isConfigured = status !== "missingConfig";
  const isSignedIn = account !== null;
  const needsAttention =
    status === "missingConfig" ||
    status === "signedOut" ||
    status === "offlineChanges" ||
    status === "syncFailed";
  const buttonLabel = getButtonLabel(status, isSignedIn);

  return (
    <section className="mt-auto border-t pt-4" aria-label="Microsoft sync">
      <div className="flex gap-2 px-3">
        {!isSignedIn ? (
          <button
            className={cn(
              "inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium",
              "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
              needsAttention &&
                "border-destructive bg-destructive text-white hover:bg-destructive/90",
            )}
            type="button"
            disabled={!isConfigured || isBusy}
            onClick={() => void signIn()}
            title={message ?? buttonLabel}
          >
            <LogIn className="size-4" aria-hidden="true" />
            {buttonLabel}
          </button>
        ) : (
          <button
            className={cn(
              "inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium",
              "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
              needsAttention &&
                "border-destructive bg-destructive text-white hover:bg-destructive/90",
            )}
            type="button"
            disabled={isBusy || !isOnline}
            onClick={() => void syncNow()}
            title={message ?? buttonLabel}
          >
            <RefreshCw
              className={cn("size-4", status === "syncing" && "animate-spin")}
              aria-hidden="true"
            />
            {buttonLabel}
          </button>
        )}
      </div>
    </section>
  );
}

function getButtonLabel(status: string, isSignedIn: boolean) {
  switch (status) {
    case "initializing":
      return "Connecting";
    case "missingConfig":
      return "Setup needed";
    case "signedOut":
      return "Sign in";
    case "synced":
      return "Synced";
    case "syncing":
      return "Syncing";
    case "offline":
      return "Offline";
    case "offlineChanges":
      return isSignedIn ? "Sync changes" : "Sign in to sync";
    case "syncFailed":
      return isSignedIn ? "Retry sync" : "Sign in";
    default:
      return isSignedIn ? "Sync" : "Sign in";
  }
}

export default MicrosoftSyncControls;
