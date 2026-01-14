import { use, useState } from 'react';
import { MilkdownProvider } from '@milkdown/react';
import type { Note } from '@/model/notes';
import { useNotesRepository } from '@/providers/notesRepository';
import { useSyncScheduleService } from '@/providers/syncScheduleService';
import NoteEditor from './NoteEditor';
import { Button } from '../ui/button';

interface Props {
  asyncNote: Promise<Note | undefined>;
}

function NoteContent({ asyncNote }: Props) {
  const note = use(asyncNote);
  const notesRepository = useNotesRepository();
  const syncScheduleService = useSyncScheduleService();

  const [defaultValue, setDefaultValue] = useState(note?.content || '');
  const [value, setValue] = useState(defaultValue);

  const handleSave = async () => {
    await notesRepository.updateNote({
      ...note!,
      content: value,
      isDirty: 1
    });

    setDefaultValue(value);
    syncScheduleService.requestSync();
  };

  const dirty = value !== defaultValue;
  return (
    <MilkdownProvider>
      <div className="flex items-center justify-end p-1 border-b">
        <Button variant={dirty ? 'destructive' : 'default'} disabled={!dirty} onClick={handleSave}>
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
