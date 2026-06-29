import type { TaskRecord } from "@/data/schemas";
import TaskDueDateControl from "./task-due-date-control";
import TaskPriorityControl from "./task-priority-control";
import TaskReminderControl from "./task-reminder-control";
import TaskRepeatControl from "./task-repeat-control";
import TaskStatusControl from "./task-status-control";

interface Props {
  task: TaskRecord;
}

function TaskControlsRow({ task }: Props) {
  return (
    <div className="flex flex-col gap-2 border-b px-4 py-2 md:flex-row">
      <TaskStatusControl task={task} />
      <TaskPriorityControl task={task} />
      <TaskDueDateControl task={task} />
      <TaskReminderControl task={task} />
      <TaskRepeatControl task={task} />
    </div>
  );
}

export default TaskControlsRow;
