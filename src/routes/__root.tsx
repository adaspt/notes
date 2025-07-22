import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { Client } from '@microsoft/microsoft-graph-client';
import type { DriveItem } from '@microsoft/microsoft-graph-types';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

export const Route = createRootRouteWithContext<{ graph: Client }>()({
  loader: async ({ context }) => {
    const response = await context.graph.api(`/me/drive/special/approot/children`).get();
    const items: Array<DriveItem> = response.value || [];
    return { items };
  },
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
