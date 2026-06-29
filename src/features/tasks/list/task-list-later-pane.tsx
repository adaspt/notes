import { startOfTomorrow } from "@/features/tasks/data/task-filters";
import { useLaterTasks } from "@/features/tasks/data/use-later-tasks";
import TaskCreateDialog from "@/features/tasks/details/task-create-dialog";
import { linkOptions } from "@tanstack/react-router";
import { useState } from "react";
import TaskListPane from "./task-list-pane";

function TaskListLaterPane() {
  const tasks = useLaterTasks();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <TaskListPane
        title="Later"
        items={tasks.items}
        getLinkOptions={(item) =>
          linkOptions({ to: "/later/$taskId", params: { taskId: item.id } })
        }
        onCreate={() => setCreating(true)}
      />
      {creating && (
        <TaskCreateDialog
          defaults={{ dueDate: startOfTomorrow() }}
          onClose={() => setCreating(false)}
          getTaskPath={(taskId) => ({ to: "/later/$taskId", params: { taskId } })}
        />
      )}
    </>
  );
}

export default TaskListLaterPane;
