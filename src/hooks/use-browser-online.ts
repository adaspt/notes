import { useEffect, useState } from "react";

const getBrowserOnline = () => {
  return globalThis.navigator.onLine;
};

export const useBrowserOnline = () => {
  const [online, setOnline] = useState(getBrowserOnline);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    return () => {
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
};
