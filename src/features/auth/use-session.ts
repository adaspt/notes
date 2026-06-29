import { useContext } from "react";
import { SessionContext } from "./session-context";

export const useSession = () => {
  const client = useContext(SessionContext);
  if (!client) {
    throw new Error("useSession should be used inside SessionProvider");
  }

  return client;
};
