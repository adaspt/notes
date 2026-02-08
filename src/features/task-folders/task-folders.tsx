import { Link, useParams } from 'react-router';
import { Calendar, Calendar1, CalendarDays } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

function TaskFolders() {
  const { setOpenMobile, isMobile } = useSidebar();

  const { tasks: taskFilter = 'today', folderId } = useParams();

  const handleFolderClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={!folderId && taskFilter === 'today'}>
              <Link to="/today" onClick={handleFolderClick}>
                <Calendar1 /> Today
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={!folderId && taskFilter === 'later'}>
              <Link to="/later" onClick={handleFolderClick}>
                <CalendarDays /> Later
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={!folderId && taskFilter === 'backlog'}>
              <Link to="/backlog" onClick={handleFolderClick}>
                <Calendar /> Backlog
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default TaskFolders;
