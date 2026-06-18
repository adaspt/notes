import { useContext } from "react";
import { CloudSyncContext } from "./cloud-sync-context";

export const useCloudSync = () => {
  const context = useContext(CloudSyncContext);
  if (!context) {
    throw new Error("useCloudSync must be used within a CloudSyncProvider");
  }

  return context;
};
