import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { Session } from "./session";
import { SessionContext, type SessionClient } from "./session-context";

interface Props {
  session: Session;
  children?: ReactNode;
}

function SessionProvider({ session, children }: Props) {
  const status = useSyncExternalStore(
    (onStatusChange) => session.subscribe(onStatusChange),
    () => session.getStatus(),
  );

  useEffect(() => {
    void session.initialize();
  }, [session]);

  const client = useMemo<SessionClient>(
    () => ({
      status,
      signIn: () => session.signIn(),
      getToken: () => session.getToken(),
    }),
    [session, status],
  );

  return <SessionContext.Provider value={client}>{children}</SessionContext.Provider>;
}

export default SessionProvider;
