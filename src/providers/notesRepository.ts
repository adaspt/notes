import type { Note } from '@/model/notes';
import type { Db } from './db';
import { createContext, useContext } from 'react';

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

  getNotes() {
    return this.#db.notes.toArray();
  }

  getDirtyNotes() {
    return this.#db.notes.where('isDirty').equals(1).toArray();
  }

  createNote(note: Note) {
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

export const NotesRepositoryProvider = NotesRepositoryContext.Provider;

export function useNotesRepository() {
  const context = useContext(NotesRepositoryContext);
  if (!context) {
    throw new Error('useNotesRepository must be used within a NotesRepositoryProvider');
  }

  return context;
}
