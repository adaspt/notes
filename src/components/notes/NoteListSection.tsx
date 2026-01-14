import { Fragment } from 'react';
import { Link, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import type { Note } from '@/model/notes';
import { useNotesRepository } from '@/providers/notesRepository';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from '@/components/ui/item';
import { SidebarTrigger } from '@/components/ui/sidebar';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

function NoteListSection() {
  const notesRepository = useNotesRepository();

  const { vaultId = '-1', projectId = '-1', noteId } = useParams();

  const project = useLiveQuery(() => notesRepository.getById(Number(projectId)), [projectId]);

  const notes = useLiveQuery(() => notesRepository.getByParentId(Number(projectId)), [projectId], [] as Note[]);
  const activeNotes = notes
    .filter((x) => !x.isDeleted && !!x.content)
    .sort((a, b) => {
      return new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime();
    });

  return (
    <div className="border-r w-(--list-width) h-svh flex flex-col">
      <div className="border-b flex items-center p-2 gap-1">
        <SidebarTrigger />
        <span className="text-base font-medium">{project?.name}</span>
      </div>
      <ItemGroup className="min-h-0 overflow-y-auto">
        {activeNotes.map((note) => (
          <Fragment key={note.id}>
            <Item className={cn({ 'bg-accent': note.id === Number(noteId) })} asChild>
              <Link to={`/${vaultId}/${projectId}/${note.id}`}>
                <ItemContent>
                  <ItemTitle>{note.name}</ItemTitle>
                  <ItemDescription>{formatDate(note.lastModifiedDateTime)}</ItemDescription>
                </ItemContent>
              </Link>
            </Item>
            <ItemSeparator />
          </Fragment>
        ))}
      </ItemGroup>
    </div>
  );
}

export default NoteListSection;
