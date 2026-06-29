import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskPriority, TaskRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateTask } from "@/features/tasks/data/task-mutations";
import { formatPriority } from "@/features/tasks/task-format";
import { cn } from "@/lib/utils";
import { SquareArrowUpRight } from "lucide-react";
import TaskControlButton from "./task-control-button";

interface Props {
  task: TaskRecord;
}

const priorities: TaskPriority[] = ["high", "normal", "low"];

function TaskPriorityControl({ task }: Props) {
  const db = useDatabase();

  const setPriority = (priority: TaskPriority) => {
    if (priority !== task.priority) {
      void updateTask(db, task.id, { priority });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TaskControlButton
            icon={
              <SquareArrowUpRight
                className={cn("size-4", task.priority === "high" && "text-destructive")}
              />
            }
            label={`${formatPriority(task.priority)} priority`}
          />
        }
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={task.priority} onValueChange={setPriority}>
          {priorities.map((priority) => (
            <DropdownMenuRadioItem key={priority} value={priority}>
              {formatPriority(priority)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaskPriorityControl;
