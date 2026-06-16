import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import TaskContentPane from "@/features/tasks/TaskContentPane";
import TaskCreateAction from "@/features/tasks/TaskCreateAction";
import TaskListPane from "@/features/tasks/TaskListPane";
import { useLaterTasks } from "@/features/tasks/use-later-tasks";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/later/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { items, isLoading } = useLaterTasks();

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title="Later" onBack={() => navigate({ to: "/" })}>
        <TaskListPane
          emptyState={isLoading ? "Loading tasks..." : "No tasks for later!"}
          floatingAction={<TaskCreateAction onClick={() => navigate({ to: "/later/create" })} />}
          items={items}
          title="Later"
          showHeader={false}
          onSelectTask={(taskId) => navigate({ to: "/later/$taskId", params: { taskId } })}
        />
      </MobileScreen>
    );
  }

  return <TaskContentPane emptyState="Select a task to view its details" />;
}
