import TaskListIndex from "@/features/tasks/list/task-list-index";
import TaskListLaterPane from "@/features/tasks/list/task-list-later-pane";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_tasks/later/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TaskListIndex pane={<TaskListLaterPane />} />;
}
