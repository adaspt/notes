import { useBacklogTasks } from "@/features/tasks/data/use-backlog-tasks";
import TaskCreateDialog from "@/features/tasks/details/task-create-dialog";
import { linkOptions } from "@tanstack/react-router";
import { useState } from "react";
import TaskListPane from "./task-list-pane";

function TaskListBacklogPane() {
  const tasks = useBacklogTasks();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <TaskListPane
        title="Backlog"
        items={tasks.items}
        getLinkOptions={(item) =>
          linkOptions({ to: "/backlog/$taskId", params: { taskId: item.id } })
        }
        onCreate={() => setCreating(true)}
      />
      {creating && (
        <TaskCreateDialog
          defaults={{ status: "deferred" }}
          onClose={() => setCreating(false)}
          getTaskPath={(taskId) => ({ to: "/backlog/$taskId", params: { taskId } })}
        />
      )}
    </>
  );
}

export default TaskListBacklogPane;
