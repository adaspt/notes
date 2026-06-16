import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import TaskContentPane from "@/features/tasks/TaskContentPane";
import TaskCreateAction from "@/features/tasks/TaskCreateAction";
import TaskListPane from "@/features/tasks/TaskListPane";
import { useBacklogTasks } from "@/features/tasks/use-backlog-tasks";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/backlog/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { items, isLoading } = useBacklogTasks();

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title="Backlog" onBack={() => navigate({ to: "/" })}>
        <TaskListPane
          emptyState={isLoading ? "Loading tasks..." : "No tasks for backlog!"}
          floatingAction={<TaskCreateAction onClick={() => navigate({ to: "/backlog/create" })} />}
          items={items}
          title="Backlog"
          showHeader={false}
          onSelectTask={(taskId) => navigate({ to: "/backlog/$taskId", params: { taskId } })}
        />
      </MobileScreen>
    );
  }

  return <TaskContentPane emptyState="Select a task to view its details" />;
}
