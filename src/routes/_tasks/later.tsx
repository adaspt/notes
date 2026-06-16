import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";

import TaskListPane from "@/features/tasks/TaskListPane";
import { useLaterTasks } from "@/features/tasks/use-later-tasks";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/later")({
  component: RouteComponent,
});

function RouteComponent() {
  const laterTaskRouteParams = useParams({ from: "/_tasks/later/$taskId", shouldThrow: false });
  const navigate = Route.useNavigate();
  const { items, isLoading } = useLaterTasks();

  const isMobile = useIsMobile();
  if (isMobile) {
    return <Outlet />;
  }

  return (
    <>
      <div className="h-full min-h-0 overflow-hidden border-r">
        <TaskListPane
          emptyState={isLoading ? "Loading tasks..." : "No tasks for later!"}
          items={items}
          title="Later"
          selectedTaskId={laterTaskRouteParams?.taskId}
          onCreateTask={() => navigate({ to: "/later/create" })}
          onSelectTask={(taskId) => navigate({ to: "/later/$taskId", params: { taskId } })}
        />
      </div>
      <Outlet />
    </>
  );
}
