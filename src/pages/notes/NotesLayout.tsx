import { Outlet } from 'react-router';
import NoteList from '@/features/note-list/note-list';

function NotesLayout() {
  return (
    <>
      <NoteList />
      <main className="bg-background relative flex flex-col w-full flex-1 h-svh min-w-0">
        <Outlet />
      </main>
    </>
  );
}

export default NotesLayout;
