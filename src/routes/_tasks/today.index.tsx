import TaskListIndex from "@/features/tasks/list/task-list-index";
import TaskListTodayPane from "@/features/tasks/list/task-list-today-pane";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tasks/today/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TaskListIndex pane={<TaskListTodayPane />} />;
}
