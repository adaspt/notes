import CreateNoteFab from '@/components/notes/create-note-fab';
import ListLayout from '@/components/shell/list-layout';
import NoteList from '@/features/note-list/note-list';

function NotesLayout() {
  return (
    <ListLayout>
      <NoteList />
      <CreateNoteFab />
    </ListLayout>
  );
}

export default NotesLayout;
