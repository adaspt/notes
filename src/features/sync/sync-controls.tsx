import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";
import { RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { usePendingChanges } from "./use-pending-changes";
import { useSync } from "./use-sync";

function SyncControls() {
  const sync = useSync();
  const isOnline = useOnlineStatus();
  const pending = usePendingChanges();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => sync.subscribe(setIsSyncing), [sync]);

  return (
    <div className="flex w-full items-center gap-2">
      {!isOnline && (
        <span
          className="text-muted-foreground flex items-center gap-1 text-xs"
          title="You're offline — changes are saved locally and will sync when you reconnect"
        >
          <WifiOff className="size-3.5" />
          Offline
        </span>
      )}
      <Button
        variant="outline"
        className="flex-1"
        disabled={isSyncing || !isOnline}
        title={isOnline ? "Sync (Ctrl+Alt+R / Cmd+Option+R)" : "Offline — will sync on reconnect"}
        onClick={() => void sync.syncNow()}
      >
        <RefreshCw className={cn(isSyncing && "animate-spin")} />
        <span>Sync</span>
        {pending > 0 && (
          <span
            className="bg-primary/10 ml-1 rounded-full px-1.5 text-xs"
            title={`${pending} change${pending === 1 ? "" : "s"} pending sync`}
          >
            {pending}
          </span>
        )}
      </Button>
    </div>
  );
}

export default SyncControls;
