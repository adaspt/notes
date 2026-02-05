import type { Note } from '@/model/notes';
import type { Task } from '@/model/tasks';
import Dexie, { type EntityTable } from 'dexie';

export function createDb() {
  const db = new Dexie('Notes') as Dexie & {
    notes: EntityTable<Note, 'id'>;
    tasks: EntityTable<Task, 'id'>;
  };

  db.version(1).stores({
    notes: '++id, &graphId, parentId, type, isDirty',
    tasks: '++id, &graphId, status, isDirty'
  });

  return db;
}

export type Db = ReturnType<typeof createDb>;
