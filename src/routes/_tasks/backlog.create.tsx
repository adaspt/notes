import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import TaskCreatePane from "@/features/tasks/TaskCreatePane";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/backlog/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const isMobile = useIsMobile();

  const createPane = (
    <TaskCreatePane
      defaultValues={{ status: "deferred" }}
      onCancel={() => navigate({ to: "/backlog" })}
      onCreated={(taskId) => navigate({ to: "/backlog/$taskId", params: { taskId } })}
    />
  );

  if (isMobile) {
    return (
      <MobileScreen title="New task" onBack={() => navigate({ to: "/backlog" })}>
        {createPane}
      </MobileScreen>
    );
  }

  return createPane;
}
