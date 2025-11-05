import { useLiveQuery } from 'dexie-react-hooks';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar';
import { useNotesRepository } from '@/providers/notesRepository';
import type { Note } from '@/model/notes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { Link, useParams } from 'react-router';

function NotesSidebarGroup() {
  const { folderId } = useParams();

  const notesRepository = useNotesRepository();
  const notes = useLiveQuery(() => notesRepository.getNotes(), [], [] as Note[]);
  const root = notes.filter((x) => !x.parentId && !x.isDeleted && !x.content);

  return root.map((group) => (
    <Collapsible key={group.id} className="group/collapsible" defaultOpen title={group.name}>
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
        >
          <CollapsibleTrigger>
            {group.name}{' '}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {notes
                .filter((folder) => folder.parentId === group.id && !folder.isDeleted && !folder.content)
                .map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton asChild isActive={String(folder.id) === folderId}>
                      <Link to={`/notes/${folder.id}`}>
                        {String(folder.id) === folderId ? <FolderOpen /> : <Folder />}
                        {folder.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  ));
}

export default NotesSidebarGroup;
