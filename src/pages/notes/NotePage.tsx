import NoteEditor from '@/components/notes/NoteEditor';
import type { NoteEditorRef } from '@/components/notes/NoteEditorContent';
import { Button } from '@/components/ui/button';
import { useQuery } from '@/hooks/useQuery';
import { useNotesRepository } from '@/providers/notesRepository';
import { useSync } from '@/providers/sync';
import { useRef } from 'react';
import { useParams } from 'react-router';

function NotePage() {
  const { noteId } = useParams();
  const syncService = useSync();
  const editor = useRef<NoteEditorRef>(null);
  const notesRepository = useNotesRepository();
  const note = useQuery(() => notesRepository.getById(Number(noteId)), [noteId]);

  if (!note.data) {
    return null;
  }

  const handleSave = async () => {
    if (!editor.current || !note.data) {
      return;
    }

    const content = editor.current.getContent();
    await notesRepository.updateNote({ ...note.data, content, isDirty: 1 });

    await syncService.sync();
  };

  return (
    <div className="grow">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold m-2">{note.data?.name}</h1>
        <Button className="mx-2" onClick={handleSave}>
          Save
        </Button>
      </div>
      <hr />
      <NoteEditor ref={editor} key={noteId} defaultValue={note.data?.content || ''} />
    </div>
  );
}

export default NotePage;
