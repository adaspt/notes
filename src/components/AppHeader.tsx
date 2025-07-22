import { Link } from '@tanstack/react-router';
import { Notebook } from 'lucide-react';
import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import { Button } from './ui/button';
import type { FC } from 'react';

const AppHeader: FC = () => {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link to="/">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Notebook className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span>Apeto</span>
                <span className="font-medium">Notes</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Button className="w-full" disabled>Create</Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};

export default AppHeader;
