import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskRecord, TaskStatus } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateTask } from "@/features/tasks/data/task-mutations";
import { formatStatus } from "@/features/tasks/task-format";
import { Check } from "lucide-react";
import TaskControlButton from "./task-control-button";

interface Props {
  task: TaskRecord;
}

const statuses: TaskStatus[] = [
  "notStarted",
  "inProgress",
  "completed",
  "waitingOnOthers",
  "deferred",
];

function TaskStatusControl({ task }: Props) {
  const db = useDatabase();

  const setStatus = (status: TaskStatus) => {
    if (status !== task.status) {
      void updateTask(db, task.id, { status });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TaskControlButton
            icon={<Check className="size-4" />}
            label={formatStatus(task.status)}
          />
        }
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={task.status} onValueChange={setStatus}>
          {statuses.map((status) => (
            <DropdownMenuRadioItem key={status} value={status}>
              {formatStatus(status)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaskStatusControl;
