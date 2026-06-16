import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";

import TaskListPane from "@/features/tasks/TaskListPane";
import { useTodayTasks } from "@/features/tasks/use-today-tasks";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/today")({
  component: RouteComponent,
});

function RouteComponent() {
  const todayTaskRouteParams = useParams({ from: "/_tasks/today/$taskId", shouldThrow: false });
  const navigate = Route.useNavigate();
  const { items, isLoading } = useTodayTasks();

  const isMobile = useIsMobile();
  if (isMobile) {
    return <Outlet />;
  }

  return (
    <>
      <div className="h-full min-h-0 overflow-hidden border-r">
        <TaskListPane
          emptyState={isLoading ? "Loading tasks..." : "No tasks for today!"}
          items={items}
          title="Today"
          selectedTaskId={todayTaskRouteParams?.taskId}
          onCreateTask={() => navigate({ to: "/today/create" })}
          onSelectTask={(taskId) => navigate({ to: "/today/$taskId", params: { taskId } })}
        />
      </div>
      <Outlet />
    </>
  );
}
