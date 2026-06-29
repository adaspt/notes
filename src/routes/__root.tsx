import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/features/app-sidebar/app-sidebar";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="h-svh w-full flex-1 bg-background text-foreground">
          <Outlet />
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
