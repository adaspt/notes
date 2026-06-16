import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import TaskCreatePane from "@/features/tasks/TaskCreatePane";
import { getLocalDateKey } from "@/features/tasks/task-list-format";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/today/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const isMobile = useIsMobile();

  const createPane = (
    <TaskCreatePane
      defaultValues={{ dueDate: getLocalDateKey() }}
      onCancel={() => navigate({ to: "/today" })}
      onCreated={(taskId) => navigate({ to: "/today/$taskId", params: { taskId } })}
    />
  );

  if (isMobile) {
    return (
      <MobileScreen title="New task" onBack={() => navigate({ to: "/today" })}>
        {createPane}
      </MobileScreen>
    );
  }

  return createPane;
}
