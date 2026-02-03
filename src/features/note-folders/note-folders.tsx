import { folderComparer, type Note } from '@/model/notes';
import { useNotesRepository } from '@/providers/notesRepository';
import { useLiveQuery } from 'dexie-react-hooks';
import NoteFolderGroup from './note-folder-group';
import { useParams } from 'react-router';

const byParent = (map: Map<number, Note[]>, item: Note) => {
  const collection = map.get(item.parentId) || [];
  collection.push(item);
  map.set(item.parentId, collection);

  return map;
};

function NoteFolders() {
  const notesRepository = useNotesRepository();
  const { folderId } = useParams();

  const folders = useLiveQuery(() => notesRepository.getByType('folder'), [], [] as Note[]);
  const folderToDisplayByParent = folders.filter((x) => !x.isDeleted).reduce(byParent, new Map<number, Note[]>());

  const rootFolders = folderToDisplayByParent.get(0)?.sort(folderComparer) || [];
  const selectedFolderId = folderId ? parseInt(folderId) : undefined;

  return rootFolders.map((folder) => (
    <NoteFolderGroup
      key={folder.id}
      folder={folder}
      foldersByParent={folderToDisplayByParent}
      selectedFolderId={selectedFolderId}
    />
  ));
}

export default NoteFolders;
