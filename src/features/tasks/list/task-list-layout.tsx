import { useIsMobile } from "@/hooks/use-mobile";
import { Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface Props {
  pane: ReactNode;
}

/** Two-pane list/detail layout on desktop; detail-only (the Outlet) on mobile. */
function TaskListLayout({ pane }: Props) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <Outlet />;
  }

  return (
    <div className="grid grid-cols-[minmax(240px,380px)_1fr]">
      {pane}
      <Outlet />
    </div>
  );
}

export default TaskListLayout;
