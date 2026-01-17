import { use, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { MilkdownProvider } from '@milkdown/react';
import type { Note } from '@/model/notes';
import { useNotesRepository } from '@/providers/notesRepository';
import { useSyncScheduleService } from '@/providers/syncScheduleService';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import NoteEditor from './NoteEditor';

interface Props {
  asyncNote: Promise<Note | undefined>;
}

function NoteContent({ asyncNote }: Props) {
  const navigate = useNavigate();
  const note = use(asyncNote);
  if (note?.type !== 'file') {
    throw new Error('Can only open markdown notes');
  }

  const notesRepository = useNotesRepository();
  const syncScheduleService = useSyncScheduleService();

  const [defaultValue, setDefaultValue] = useState(note?.content || '');
  const [value, setValue] = useState(defaultValue);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const handleSave = async () => {
    await notesRepository.updateNote({
      ...note!,
      content: value,
      isDirty: 1
    });

    setDefaultValue(value);
    syncScheduleService.requestSync();
  };

  const handleDelete = async () => {
    await notesRepository.updateNote({
      ...note!,
      isDeleted: 1,
      isDirty: 1
    });

    navigate('..');
    syncScheduleService.requestSync();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveButtonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const dirty = value !== defaultValue;
  return (
    <MilkdownProvider>
      <div className="flex items-center justify-end p-1 gap-2 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">More</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button ref={saveButtonRef} variant={dirty ? 'destructive' : 'default'} disabled={!dirty} onClick={handleSave}>
          Save
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <NoteEditor defaultValue={defaultValue} onChange={setValue} />
      </div>
    </MilkdownProvider>
  );
}

export default NoteContent;
