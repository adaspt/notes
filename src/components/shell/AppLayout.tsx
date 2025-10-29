import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from './AppSidebar';
import { Outlet } from 'react-router';

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default AppLayout;
