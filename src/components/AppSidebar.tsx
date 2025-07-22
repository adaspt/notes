import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Sidebar, SidebarContent, useSidebar } from './ui/sidebar';
import AppHeader from './AppHeader';
import BookmarkedSidebarGroup from './BookmarkedSidebarGroup';
import NoteTreeSidebarGroup from './NoteTreeSidebarGroup';
import type { FC } from 'react';

const AppSidebar: FC = () => {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  useEffect(() => router.subscribe('onBeforeNavigate', () => setOpenMobile(false)), []);

  return (
    <Sidebar>
      <AppHeader />
      <SidebarContent>
        <BookmarkedSidebarGroup />
        <NoteTreeSidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
