import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import type { Note } from '@/model/notes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

interface Props {
  folder: Note;
  foldersByParent: Map<number, Note[]>;
  selectedFolderId?: number;
}

function NoteFolderGroup({ folder, foldersByParent, selectedFolderId }: Props) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleFolderClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const folders = foldersByParent.get(folder.id) || [];
  return (
    <Collapsible key={folder.id} defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            {folder.name}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={selectedFolderId === folder.id}>
                  <Link to={`/${folder.id}`} onClick={handleFolderClick}>
                    Inbox
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            {folders.map((subFolder) => (
              <SidebarMenuItem key={subFolder.id}>
                <SidebarMenuButton asChild isActive={selectedFolderId === subFolder.id}>
                  <Link to={`/${subFolder.id}`} onClick={handleFolderClick}>
                    {subFolder.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export default NoteFolderGroup;
