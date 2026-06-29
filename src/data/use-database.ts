import { useContext } from "react";
import { DatabaseContext } from "./database-context";

export const useDatabase = () => {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error("useDatabase should be used inside DatabaseProvider");
  }

  return db;
};
