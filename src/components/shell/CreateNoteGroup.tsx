import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { SidebarGroup, SidebarGroupContent } from '../ui/sidebar';
import CreateNoteForm from './CreateNoteForm';
import { useNavigate } from 'react-router';

function CreateNoteGroup() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleSaved = (vaultId: number, projectId: number, id: number) => {
    setOpen(false);
    navigate(`/${vaultId}/${projectId}/${id}`);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Create note</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create note</DialogTitle>
              <DialogDescription>Create a new note in active project</DialogDescription>
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default CreateNoteGroup;
