import { useLiveQuery } from 'dexie-react-hooks';
import { Link, Outlet, useParams } from 'react-router';
import { useNotesRepository } from '@/providers/notesRepository';
import type { Note } from '@/model/notes';
import { Item, ItemContent } from '@/components/ui/item';

function NotesPage() {
  const { folderId } = useParams();
  const notesRepository = useNotesRepository();
  const notes = useLiveQuery(() => notesRepository.getNotes(), [], [] as Note[]);

  const data = notes.filter((x) => String(x.parentId) === folderId && !x.isDeleted && x.content);
  return (
    <div>
      <div className="flex">
        <div className="flex flex-col grow-0 shrink-0 basis-xs">
          <h1 className="text-2xl font-semibold m-2">Notes</h1>
          <hr />
          <div className="flex flex-col gap-2 p-2">
            {data.map((x) => (
              <Link key={x.id} to={`/notes/${folderId}/${x.id}`}>
                <Item variant="outline">
                  <ItemContent>{x.name}</ItemContent>
                </Item>
              </Link>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default NotesPage;
