import type { Note } from '@/model/notes';
import Dexie, { type EntityTable } from 'dexie';

export function createDb() {
  const db = new Dexie('Notes') as Dexie & {
    notes: EntityTable<Note, 'id'>;
  };

  db.version(1).stores({
    notes: '++id, &graphId, parentId, isDirty'
  });

  return db;
}

export type Db = ReturnType<typeof createDb>;
