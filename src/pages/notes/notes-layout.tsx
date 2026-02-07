import ListLayout from '@/components/shell/list-layout';
import NoteList from '@/features/note-list/note-list';

function NotesLayout() {
  return (
    <ListLayout>
      <NoteList />
    </ListLayout>
  );
}

export default NotesLayout;
