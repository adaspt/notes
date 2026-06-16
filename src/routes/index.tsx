import NavigationPane from "@/features/app-shell/NavigationPane";
import { useIsMobile } from "@/hooks/use-mobile";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <NavigationPane />;
  }

  return <Navigate to="/today" replace />;
}
