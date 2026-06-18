import { useEffect, useState } from "react";

const getBrowserVisible = () => globalThis.document.visibilityState === "visible";

export const useBrowserVisible = () => {
  const [visible, setVisible] = useState(getBrowserVisible);

  useEffect(() => {
    const handleVisibilityChange = () => setVisible(getBrowserVisible());

    globalThis.document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      globalThis.document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return visible;
};
