import { Outlet } from 'react-router';
import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from './AppSidebar';
import NoteListSection from '../notes/NoteListSection';

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <NoteListSection />
      <main className="bg-background relative flex flex-col w-full flex-1 h-svh">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default AppLayout;
