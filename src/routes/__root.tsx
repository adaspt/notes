import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { Client } from '@microsoft/microsoft-graph-client';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

export const Route = createRootRouteWithContext<{ graph: Client }>()({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
