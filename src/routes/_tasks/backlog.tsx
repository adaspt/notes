import TaskListLayout from "@/features/tasks/list/task-list-layout";
import TaskListBacklogPane from "@/features/tasks/list/task-list-backlog-pane";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tasks/backlog")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TaskListLayout pane={<TaskListBacklogPane />} />;
}
