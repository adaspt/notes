import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import TaskCreatePane from "@/features/tasks/TaskCreatePane";
import { getTomorrowDateKey } from "@/features/tasks/task-mutations";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/later/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const isMobile = useIsMobile();

  const createPane = (
    <TaskCreatePane
      defaultValues={{ dueDate: getTomorrowDateKey() }}
      onCancel={() => navigate({ to: "/later" })}
      onCreated={(taskId) => navigate({ to: "/later/$taskId", params: { taskId } })}
    />
  );

  if (isMobile) {
    return (
      <MobileScreen title="New task" onBack={() => navigate({ to: "/later" })}>
        {createPane}
      </MobileScreen>
    );
  }

  return createPane;
}
