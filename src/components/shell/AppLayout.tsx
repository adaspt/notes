import { Outlet } from 'react-router';
import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from './AppSidebar';

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Outlet />
    </SidebarProvider>
  );
}

export default AppLayout;
