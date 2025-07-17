import { Link } from '@tanstack/react-router';
import { Bookmark } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from './ui/sidebar';
import type { FC } from 'react';

const list = [
  {
    name: 'Personal :: Projects :: Notes',
    path: '/Personal/Projects/notes.md'
  },
  {
    name: 'Work :: BDO :: Sprint',
    path: '/Work/BDO/Sprint.md'
  }
];

const BookmarkedSidebarGroup: FC = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {list.map((x) => (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/$" params={{ _splat: x.path }}>
                  <Bookmark />
                  <span>{x.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default BookmarkedSidebarGroup;
