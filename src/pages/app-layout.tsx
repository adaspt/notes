import { Outlet } from 'react-router';
import { SidebarProvider } from '../components/ui/sidebar';
import AppSidebar from '../components/shell/app-sidebar';

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Outlet />
    </SidebarProvider>
  );
}

export default AppLayout;
