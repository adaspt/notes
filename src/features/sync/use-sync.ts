import { useContext } from "react";
import { SyncContext } from "./sync-context";

export const useSync = () => {
  const client = useContext(SyncContext);
  if (!client) {
    throw new Error("useSync should be used inside SyncProvider");
  }

  return client;
};
