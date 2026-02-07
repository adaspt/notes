import { Link, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import type { Note } from '@/model/notes';
import { NotesRepository, useNotesRepository } from '@/providers/notesRepository';
import { useIsMobile } from '@/hooks/use-mobile';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { SidebarTrigger } from '@/components/ui/sidebar';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const notesQuery = (notesRepository: NotesRepository, folderId: number) => async () => {
  const notes =
    folderId === -1 ? await notesRepository.getByType('file') : await notesRepository.getByParentId(folderId);

  return notes
    .filter((x) => !x.isDeleted && x.type === 'file')
    .sort((a, b) => {
      return new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime();
    })
    .filter((_, i) => folderId != -1 || i < 10);
};

function NoteList() {
  const isMobile = useIsMobile();
  const notesRepository = useNotesRepository();

  const { folderId = '-1', noteId } = useParams();

  const folder = useLiveQuery(() => notesRepository.getById(Number(folderId)), [folderId]);

  const notes = useLiveQuery(notesQuery(notesRepository, Number(folderId)), [folderId], [] as Note[]);
  const activeNotes = notes
    .filter((x) => !x.isDeleted && x.type === 'file')
    .sort((a, b) => {
      return new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime();
    });

  return (
    <div className={cn('border-r w-md sm:w-xs max-w-dvw h-dvh flex flex-col', isMobile && noteId ? 'hidden' : '')}>
      <div className="border-b flex items-center p-2 gap-1">
        <SidebarTrigger />
        <span className="text-base font-medium">{folder?.name || 'Recent notes'}</span>
      </div>
      <ItemGroup className="min-h-0 overflow-y-auto gap-2 p-2">
        {activeNotes.map((note) => (
          <Item key={note.id} variant="outline" className={cn({ 'bg-accent': note.id === Number(noteId) })} asChild>
            <Link to={`/notes/${note.parentId}/${note.id}`}>
              <ItemContent>
                <ItemTitle>{note.name}</ItemTitle>
                <ItemDescription className="wrap-anywhere">{note.content?.replaceAll('\n', ' ')}</ItemDescription>
                <ItemDescription className="text-xs">
                  Last modified: {formatDate(note.lastModifiedDateTime)}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}

export default NoteList;
