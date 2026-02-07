import { Link, useParams } from 'react-router';
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
                Today
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={!folderId && taskFilter === 'later'}>
              <Link to="/later" onClick={handleFolderClick}>
                Later
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={!folderId && taskFilter === 'backlog'}>
              <Link to="/backlog" onClick={handleFolderClick}>
                Backlog
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default TaskFolders;
