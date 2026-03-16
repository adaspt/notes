import { Link, useLocation, useParams } from 'react-router';
import { Calendar, Calendar1, CalendarDays, Notebook } from 'lucide-react';
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
  const location = useLocation();

  const { tasks: taskFilter = 'today' } = useParams();
  const isNotesRoute = location.pathname === '/notes' || location.pathname.startsWith('/notes/');
  const isRecentNotesRoute = location.pathname === '/notes' || location.pathname.startsWith('/notes/-1');

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
            <SidebarMenuButton asChild isActive={!isNotesRoute && taskFilter === 'today'}>
              <Link to="/today" onClick={handleFolderClick}>
                <Calendar1 /> Today
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={!isNotesRoute && taskFilter === 'later'}>
              <Link to="/later" onClick={handleFolderClick}>
                <CalendarDays /> Later
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={!isNotesRoute && taskFilter === 'backlog'}>
              <Link to="/backlog" onClick={handleFolderClick}>
                <Calendar /> Backlog
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isRecentNotesRoute}>
              <Link to="/notes" onClick={handleFolderClick}>
                <Notebook /> Recent notes
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default TaskFolders;
