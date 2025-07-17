import { Sidebar, SidebarContent } from './ui/sidebar';
import NoteListSidebarGroup from './NoteListSidebarGroup';
import MainSidebarGroup from './MainSidebarGroup';
import BookmarkedSidebarGroup from './BookmarkedSidebarGroup';
import type { FC } from 'react';

const AppSidebar: FC = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <MainSidebarGroup />
        <BookmarkedSidebarGroup />
        <NoteListSidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
