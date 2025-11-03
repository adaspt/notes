import Dexie, { type EntityTable } from 'dexie';
import { createContext, createElement, type ReactNode } from 'react';
import type { Task } from '../model/tasks.ts';
import type { Note } from '@/model/notes.ts';

export function createDb() {
  const db = new Dexie('Notes') as Dexie & {
    tasks: EntityTable<Task, 'id'>;
    notes: EntityTable<Note, 'id'>;
  };

  db.version(1).stores({
    tasks: '++id, &graphId, status, isDirty',
    notes: '++id, &graphId, isDirty'
  });

  return db;
}

export type Db = ReturnType<typeof createDb>;

const DbContext = createContext<Db | null>(null);

interface DbProviderProps {
  db: Db;
  children: ReactNode;
}

export function DbProvider({ db, children }: DbProviderProps) {
  return createElement(DbContext.Provider, { value: db }, children);
}
