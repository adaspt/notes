import { graphQuery } from '../hooks/useApiQuery';

interface DriveItemDto {
  id: string;
  name: string;
  folder?: {};
  file?: {};
}

interface File {
  id: string;
  name: string;
  type: 'file';
}

interface Folder {
  id: string;
  name: string;
  type: 'folder';
}

const mapNoteDtoToModel = (dto: { value: DriveItemDto[] }): Array<File | Folder> =>
  dto.value.map((x) => ({
    id: x.id,
    name: x.name,
    type: x.file ? 'file' : 'folder'
  }));

export const getItems = () =>
  graphQuery(
    '/drive/special/approot/children',
    {
      $select: 'id,name,folder,file'
    },
    mapNoteDtoToModel
  );
