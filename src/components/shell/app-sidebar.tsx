import { Link } from 'react-router';
import { Notebook } from 'lucide-react';
import TaskFolders from '@/features/task-folders/task-folders';
import NoteFolders from '@/features/note-folders/note-folders';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar';
import CreateNoteGroup from './create-note-group';
import SyncSection from './sync/sync-section';

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Notebook className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Notes</span>
                  <span className="">v3.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <CreateNoteGroup />
      </SidebarHeader>
      <SidebarContent>
        <TaskFolders />
        <NoteFolders />
      </SidebarContent>
      <SidebarFooter>
        <SyncSection />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
