import type { Note } from '@/model/notes';
import { useNotesRepository } from '@/providers/notesRepository';
import { useLiveQuery } from 'dexie-react-hooks';

function NotesPage() {
  const notesRepository = useNotesRepository();
  const notes = useLiveQuery(() => notesRepository.getNotes(), [], [] as Note[]);

  return (
    <>
      <h1>Notes</h1>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.name} - {note.createdDateTime} - {note.parentId}
          </li>
        ))}
      </ul>
    </>
  );
}

export default NotesPage;
