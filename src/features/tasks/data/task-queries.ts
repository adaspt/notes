import type { Database } from "@/data/database";

export const listPendingTasks = (db: Database) =>
  db.tasks
    .where("status")
    .anyOf("notStarted", "inProgress", "waitingOnOthers", "deferred")
    .filter((x) => x.deletedAt === null)
    .toArray();
