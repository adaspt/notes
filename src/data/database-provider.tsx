import type { ReactNode } from "react";
import type { Database } from "./database";
import { DatabaseContext } from "./database-context";

interface Props {
  db: Database;
  children?: ReactNode;
}

function DatabaseProvider({ db, children }: Props) {
  return <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>;
}

export default DatabaseProvider;
