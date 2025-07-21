import { Sidebar, SidebarContent } from './ui/sidebar';
import MainSidebarGroup from './MainSidebarGroup';
import BookmarkedSidebarGroup from './BookmarkedSidebarGroup';
import NoteTreeSidebarGroup from './NoteTreeSidebarGroup';
import type { FC } from 'react';

const AppSidebar: FC = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <MainSidebarGroup />
        <BookmarkedSidebarGroup />
        <NoteTreeSidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
