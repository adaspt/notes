import { useEffect, useState } from "react";
import { useSync } from "./use-sync";

function SyncShortcut() {
  const sync = useSync();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => sync.subscribe(setIsSyncing), [sync]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !event.altKey ||
        !(event.ctrlKey || event.metaKey) ||
        event.shiftKey ||
        event.key.toLowerCase() !== "r"
      ) {
        return;
      }

      event.preventDefault();
      if (!isSyncing) {
        void sync.syncNow();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSyncing, sync]);

  return null;
}

export default SyncShortcut;
