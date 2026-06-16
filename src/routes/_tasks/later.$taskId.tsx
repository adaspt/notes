import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import TaskDetailPane from "@/features/tasks/TaskDetailPane";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_tasks/later/$taskId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { taskId } = Route.useParams();

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title="Task" onBack={() => navigate({ to: "/later" })}>
        <TaskDetailPane taskId={taskId} />
      </MobileScreen>
    );
  }

  return <TaskDetailPane taskId={taskId} />;
}
