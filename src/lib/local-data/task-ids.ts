import type { NotesLocalDatabase } from "./database";

const localTaskIdAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const localTaskIdLength = 10;

export async function createUniqueTaskId(database: NotesLocalDatabase) {
  while (true) {
    const id = createRandomTaskId();
    if (!(await database.tasks.get(id))) {
      return id;
    }
  }
}

export function createRandomTaskId() {
  const values = new Uint8Array(localTaskIdLength);
  crypto.getRandomValues(values);

  return Array.from(
    values,
    (value) => localTaskIdAlphabet[value % localTaskIdAlphabet.length],
  ).join("");
}
