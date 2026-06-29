import { useTodayTasks } from "@/features/tasks/data/use-today-tasks";
import TaskCreateDialog from "@/features/tasks/details/task-create-dialog";
import { linkOptions } from "@tanstack/react-router";
import { useState } from "react";
import TaskListPane from "./task-list-pane";

function TaskListTodayPane() {
  const tasks = useTodayTasks();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <TaskListPane
        title="Today"
        items={tasks.items}
        getLinkOptions={(item) =>
          linkOptions({ to: "/today/$taskId", params: { taskId: item.id } })
        }
        onCreate={() => setCreating(true)}
      />
      {creating && (
        <TaskCreateDialog
          onClose={() => setCreating(false)}
          getTaskPath={(taskId) => ({ to: "/today/$taskId", params: { taskId } })}
        />
      )}
    </>
  );
}

export default TaskListTodayPane;
