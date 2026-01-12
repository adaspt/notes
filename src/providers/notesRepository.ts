import type { Note } from '@/model/notes';
import type { Db } from './db';
import { createContext, createElement, useContext, type ReactNode } from 'react';

export class NotesRepository {
  constructor(db: Db) {
    this.#db = db;
  }

  #db: Db;

  getById(id: number) {
    return this.#db.notes.get(id);
  }

  getByGraphId(graphId: string) {
    return this.#db.notes.where('graphId').equals(graphId).first();
  }

  getByParentId(parentId: number) {
    return this.#db.notes.where('parentId').equals(parentId).toArray();
  }

  getDirtyNotes() {
    return this.#db.notes.where('isDirty').equals(1).toArray();
  }

  createNote(note: Note) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = note;
    return this.#db.notes.add(rest);
  }

  updateNote(note: Note) {
    return this.#db.notes.put(note);
  }

  deleteNote(id: number) {
    return this.#db.notes.delete(id);
  }
}

const NotesRepositoryContext = createContext<NotesRepository | null>(null);

export function NotesRepositoryProvider({ value, children }: { value: NotesRepository; children: ReactNode }) {
  return createElement(NotesRepositoryContext.Provider, { value }, children);
}

export function useNotesRepository() {
  const context = useContext(NotesRepositoryContext);
  if (!context) {
    throw new Error('useNotesRepository must be used within a NotesRepositoryProvider');
  }

  return context;
}
