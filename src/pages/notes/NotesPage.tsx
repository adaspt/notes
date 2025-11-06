import { useLiveQuery } from 'dexie-react-hooks';
import { Link, Outlet, useParams } from 'react-router';
import { useNotesRepository } from '@/providers/notesRepository';
import type { Note } from '@/model/notes';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';

function NotesPage() {
  const { folderId, noteId } = useParams();
  const notesRepository = useNotesRepository();
  const notes = useLiveQuery(() => notesRepository.getNotes(), [], [] as Note[]);

  const data = notes
    .filter((x) => String(x.parentId) === folderId && !x.isDeleted && x.content)
    .toSorted((a, b) => new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime());

  return (
    <div>
      <div className="flex">
        <div className="flex flex-col grow-0 shrink-0 basis-xs">
          <h1 className="text-2xl font-semibold m-2">Notes</h1>
          <hr />
          <div className="flex flex-col gap-2 p-2">
            {data.map((x) => (
              <Item key={x.id} variant="outline" className={noteId === String(x.id) ? 'bg-accent' : ''} asChild>
                <Link to={`/notes/${folderId}/${x.id}`}>
                  <ItemContent>
                    <ItemTitle>{x.name}</ItemTitle>
                    <ItemDescription>{x.content?.substring(0, 100)}...</ItemDescription>
                  </ItemContent>
                </Link>
              </Item>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default NotesPage;
