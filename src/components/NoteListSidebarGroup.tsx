import { CornerLeftUp, File, Folder } from 'lucide-react';
import { Link, useParams, useRouteContext } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from './ui/sidebar';
import type { FC } from 'react';
import type { DriveItem } from '@/model/driveItem';

const isVisibleFolderOrNote = (item: DriveItem) =>
  (item.folder && !item.name.startsWith('.')) || (item.file && item.name.endsWith('.md'));

const compareByTypeAndName = (a: DriveItem, b: DriveItem) => {
  if (a.folder && !b.folder) return -1; // Folders first
  if (!a.folder && b.folder) return 1; // Files after folders
  return a.name.localeCompare(b.name); // Sort by name
};

const NoteListSidebarGroup: FC = () => {
  const [list, setList] = useState<Array<DriveItem>>([]);
  const { _splat = '' } = useParams({ strict: false });
  const { graph } = useRouteContext({ from: '__root__' });

  const path = (_splat.endsWith('.md') ? _splat.split('/').slice(0, -1).filter(Boolean).join('/') : _splat) || '/';
  useEffect(() => {
    const loadData = async () => {
      const response = await graph.api(`/me/drive/special/approot:/${path}:/children`).get();
      const result: Array<DriveItem> = response.value || [];
      setList(result.filter(isVisibleFolderOrNote).sort(compareByTypeAndName));
    };

    loadData().catch(console.error);
  }, [path]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/$" params={{ _splat: `${path.split('/').slice(0, -1).join('/')}` }}>
                <CornerLeftUp />
                <span>..</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {list.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <Link to="/$" params={{ _splat: `${path}/${item.name}` }}>
                  {item.folder ? <Folder /> : <File />}
                  {item.name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NoteListSidebarGroup;
