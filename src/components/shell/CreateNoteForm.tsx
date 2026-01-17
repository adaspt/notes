import { useActionState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useParams } from 'react-router';
import { useNotesRepository } from '@/providers/notesRepository';
import { useSyncScheduleService } from '@/providers/syncScheduleService';

interface Props {
  id: string;
  onSaved: (vaultId: number, projectId: number, id: number) => void;
}

function CreateNoteForm({ id, onSaved }: Props) {
  const notesRepository = useNotesRepository();
  const sync = useSyncScheduleService();

  const { vaultId, projectId } = useParams();

  const createNote = async (_: FormData, data: FormData) => {
    const name = data.get('name') as string;
    const id = await notesRepository.createNote({
      id: 0,
      graphId: null,
      parentId: Number(projectId),
      type: 'file',
      name: `${name}.md`,
      content: '',
      createdDateTime: new Date().toISOString(),
      lastModifiedDateTime: new Date().toISOString(),
      isDeleted: 0,
      isDirty: 1
    });

    sync.requestSync();

    onSaved(Number(vaultId), Number(projectId), id);

    return data;
  };

  const [actionState, action] = useActionState(createNote, new FormData());

  return (
    <form id={id} action={action}>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input id="name-1" name="name" defaultValue={(actionState.get('name') as string) || ''} required />
      </div>
    </form>
  );
}

export default CreateNoteForm;
