import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import TaskContentPane from "@/features/tasks/TaskContentPane";
import TaskCreateAction from "@/features/tasks/TaskCreateAction";
import TaskListPane from "@/features/tasks/TaskListPane";
import { useTodayTasks } from "@/features/tasks/use-today-tasks";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/today/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { items, isLoading } = useTodayTasks();

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title="Today" onBack={() => navigate({ to: "/" })}>
        <TaskListPane
          emptyState={isLoading ? "Loading tasks..." : "No tasks for today!"}
          floatingAction={<TaskCreateAction onClick={() => navigate({ to: "/today/create" })} />}
          items={items}
          title="Today"
          showHeader={false}
          onSelectTask={(taskId) => navigate({ to: "/today/$taskId", params: { taskId } })}
        />
      </MobileScreen>
    );
  }

  return <TaskContentPane emptyState="Select a task to view its details" />;
}
