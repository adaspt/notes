import { Link } from '@tanstack/react-router';
import { Bookmark, Trash2 } from 'lucide-react';
import { useStore } from '@tanstack/react-store';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem
} from './ui/sidebar';
import type { FC } from 'react';
import { bookmarkStore, removeBookmark } from '@/stores/bookmarkStore';

const BookmarkedSidebarGroup: FC = () => {
  const bookmarks = useStore(bookmarkStore);
  if (bookmarks.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {bookmarks.map((x) => (
            <SidebarMenuItem key={x.id}>
              <SidebarMenuButton asChild>
                <Link to="/$id" params={{ id: x.id }} activeProps={{ className: 'font-medium' }}>
                  <Bookmark />
                  <span>{x.title}</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuAction showOnHover onClick={() => removeBookmark(x.id)}>
                <Trash2 />
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default BookmarkedSidebarGroup;
