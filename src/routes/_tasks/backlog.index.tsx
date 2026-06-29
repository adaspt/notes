import TaskListIndex from "@/features/tasks/list/task-list-index";
import TaskListBacklogPane from "@/features/tasks/list/task-list-backlog-pane";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tasks/backlog/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TaskListIndex pane={<TaskListBacklogPane />} />;
}
