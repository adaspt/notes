import { Link } from 'react-router';
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/tasks/today">Today</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/tasks/later">Later</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/tasks/someday">Someday</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
    </Sidebar>
  );
}

export default AppSidebar;
