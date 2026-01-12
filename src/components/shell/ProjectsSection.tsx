import { Link, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Note } from '@/model/notes';
import { useNotesRepository } from '@/providers/notesRepository';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '../ui/sidebar';

function ProjectsSection() {
  const notesRepository = useNotesRepository();

  const { vaultId, projectId } = useParams();

  const notes = useLiveQuery(() => notesRepository.getByParentId(Number(vaultId)), [vaultId], [] as Note[]);
  const projects = notes.filter((x) => !x.isDeleted && !x.content);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {projects.map((project) => (
            <SidebarMenuItem key={project.id}>
              <SidebarMenuButton asChild isActive={String(project.id) === projectId}>
                <Link to={`/${vaultId}/${project.id}`}>{project.name}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default ProjectsSection;
