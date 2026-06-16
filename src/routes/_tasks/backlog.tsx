import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";

import TaskListPane from "@/features/tasks/TaskListPane";
import { useBacklogTasks } from "@/features/tasks/use-backlog-tasks";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/backlog")({
  component: RouteComponent,
});

function RouteComponent() {
  const backlogTaskRouteParams = useParams({ from: "/_tasks/backlog/$taskId", shouldThrow: false });
  const navigate = Route.useNavigate();
  const { items, isLoading } = useBacklogTasks();

  const isMobile = useIsMobile();
  if (isMobile) {
    return <Outlet />;
  }

  return (
    <>
      <div className="h-full min-h-0 overflow-hidden border-r">
        <TaskListPane
          emptyState={isLoading ? "Loading tasks..." : "No tasks for backlog!"}
          items={items}
          title="Backlog"
          selectedTaskId={backlogTaskRouteParams?.taskId}
          onCreateTask={() => navigate({ to: "/backlog/create" })}
          onSelectTask={(taskId) => navigate({ to: "/backlog/$taskId", params: { taskId } })}
        />
      </div>
      <Outlet />
    </>
  );
}
