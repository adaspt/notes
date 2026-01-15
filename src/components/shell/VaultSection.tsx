import { Link, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, ChevronsUpDown, Notebook } from 'lucide-react';
import type { Note } from '@/model/notes';
import { useNotesRepository } from '@/providers/notesRepository';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

function VaultSection() {
  const notesRepository = useNotesRepository();

  const { vaultId } = useParams();

  const notes = useLiveQuery(() => notesRepository.getByParentId(0), [], [] as Note[]);
  const root = notes.filter((x) => !x.isDeleted && !x.content);
  const selected = vaultId ? notes.find((x) => String(x.id) === vaultId) : null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Notebook className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Notes</span>
                <span className="">{selected?.name || 'Select a vault'}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
            {root.map((note) => (
              <DropdownMenuItem key={note.id} asChild>
                <Link to={`/${note.id}`}>
                  {note.name || 'Untitled'}
                  {vaultId === String(note.id) && <Check className="ml-auto" />}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default VaultSection;
