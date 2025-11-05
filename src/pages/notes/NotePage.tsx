import { useQuery } from '@/hooks/useQuery';
import { useNotesRepository } from '@/providers/notesRepository';
import { useParams } from 'react-router';

function NotePage() {
  const { noteId } = useParams();
  const notesRepository = useNotesRepository();
  const note = useQuery(() => notesRepository.getById(Number(noteId)), [noteId]);
  return (
    <div className="grow">
      <h1 className="text-2xl font-semibold m-2">{note.data?.name}</h1>
      <hr />
      <div className="whitespace-pre-wrap">{note.data?.content}</div>
    </div>
  );
}

export default NotePage;
