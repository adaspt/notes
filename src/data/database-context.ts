import { createContext } from "react";
import { Database } from "./database";

export const DatabaseContext = createContext<Database | null>(null);
