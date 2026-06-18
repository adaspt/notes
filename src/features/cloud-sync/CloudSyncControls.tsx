import { useAuthentication } from "@/lib/auth/use-authentication";
import { useCloudSync } from "./use-cloud-sync";
import { cn } from "@/lib/utils";
import { LogIn, RefreshCw } from "lucide-react";

function CloudSyncControls() {
  const auth = useAuthentication();
  const sync = useCloudSync();

  const isBusy = auth.status === "initializing" || sync.status === "syncing";
  const isSignedIn = auth.status === "signedIn";
  const needsAttention = auth.status !== "signedIn" || sync.status === "error";

  return (
    <section className="flex mt-auto" aria-label="Microsoft sync">
      {!isSignedIn ? (
        <button
          className={cn(
            "inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium",
            "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
            needsAttention &&
              "border-destructive bg-destructive text-white hover:bg-destructive/90",
          )}
          type="button"
          disabled={isBusy}
          onClick={() => auth.signIn()}
        >
          <LogIn className="size-4" />
          Sign In
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
          disabled={isBusy}
          onClick={() => sync.syncNow()}
        >
          <RefreshCw className={cn("size-4", sync.status === "syncing" && "animate-spin")} />
          Sync
        </button>
      )}
    </section>
  );
}

export default CloudSyncControls;
