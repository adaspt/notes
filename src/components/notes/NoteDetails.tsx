import { Suspense } from 'react';
import { useParams } from 'react-router';
import { useNotesRepository } from '@/providers/notesRepository';
import NoteContent from './NoteContent';

function NoteDetails() {
  const notesRepository = useNotesRepository();

  const { noteId } = useParams();
  const asyncNote = notesRepository.getById(Number(noteId ?? -1));

  return (
    <Suspense key={noteId} fallback={<div>Loading note...</div>}>
      <NoteContent asyncNote={asyncNote} />
    </Suspense>
  );
}

export default NoteDetails;
