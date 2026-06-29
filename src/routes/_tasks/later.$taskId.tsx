import TaskDetails from "@/features/tasks/details/task-details";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tasks/later/$taskId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { taskId } = Route.useParams();
  const navigate = Route.useNavigate();

  return <TaskDetails taskId={taskId} onNavigateToList={() => navigate({ to: "/later" })} />;
}
