import NavigationPane from "@/features/app-shell/NavigationPane";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="h-svh overflow-hidden bg-background text-foreground">
      <div className="hidden h-svh grid-cols-[240px_minmax(280px,380px)_1fr] overflow-hidden md:grid">
        <aside className="min-h-0 overflow-hidden border-r bg-muted/30">
          <NavigationPane />
        </aside>
        <Outlet />
      </div>
      <div className="h-svh overflow-hidden md:hidden">
        <Outlet />
      </div>
    </main>
  );
}
