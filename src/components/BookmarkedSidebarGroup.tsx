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
    name: 'Personal / Projects / notes.md',
    id: '24ED83B92E9CD012!s1da45965b1da470d87934851500ec366'
  },
  {
    name: 'Work / BDO / Sprint.md',
    id: '24ED83B92E9CD012!81785'
  },
  {
    name: 'Work / Reiz / SkillIT.md',
    id: '24ED83B92E9CD012!s0b73b3ebf7504ac78a72e63afb094c60'
  }
];

const BookmarkedSidebarGroup: FC = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {list.map((x) => (
            <SidebarMenuItem key={x.id}>
              <SidebarMenuButton asChild>
                <Link to="/$id" params={{ id: x.id }} activeProps={{ className: 'font-medium' }}>
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
