import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import CreateNoteForm from '@/components/shell/create-note-form';

function CreateNoteFab() {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const [open, setOpen] = useState(false);

  const selectedFolderId = Number(folderId);

  if (!folderId || Number.isNaN(selectedFolderId) || selectedFolderId === -1) {
    return null;
  }

  const handleSaved = (folderId: number, id: number) => {
    setOpen(false);
    navigate(`/notes/${folderId}/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed right-4 bottom-4 z-50 size-14 rounded-full shadow-lg sm:right-6 sm:bottom-6">
          <Plus className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create note</DialogTitle>
          <DialogDescription>Create a new note in active folder</DialogDescription>
        </DialogHeader>
        <CreateNoteForm id="create-note-form" onSaved={handleSaved} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="create-note-form">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNoteFab;
