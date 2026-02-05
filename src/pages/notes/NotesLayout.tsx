import { Outlet } from 'react-router';
import NoteListSection from '@/components/notes/NoteListSection';

function NotesLayout() {
  return (
    <>
      <NoteListSection />
      <main className="bg-background relative flex flex-col w-full flex-1 h-svh min-w-0">
        <Outlet />
      </main>
    </>
  );
}

export default NotesLayout;
