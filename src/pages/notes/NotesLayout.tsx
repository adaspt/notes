import ListLayout from '@/components/shell/ListLayout';
import NoteList from '@/features/note-list/note-list';

function NotesLayout() {
  return (
    <ListLayout>
      <NoteList />
    </ListLayout>
  );
}

export default NotesLayout;
