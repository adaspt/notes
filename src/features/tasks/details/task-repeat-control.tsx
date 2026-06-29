import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { type UpdateTaskInput, updateTask } from "@/features/tasks/data/task-mutations";
import { formatRecurrence } from "@/features/tasks/task-format";
import { Repeat } from "lucide-react";
import TaskControlButton from "./task-control-button";
import { startOfDay } from "./task-date-utils";
import {
  buildRecurrence,
  getRecurrencePreset,
  recurrencePresets,
  type RecurrencePreset,
} from "./task-recurrence";

interface Props {
  task: TaskRecord;
}

function TaskRepeatControl({ task }: Props) {
  const db = useDatabase();
  const label = formatRecurrence(task.recurrence);
  const preset = getRecurrencePreset(task.recurrence);

  const setPreset = (nextPreset: RecurrencePreset) => {
    const anchor = task.dueDate ?? new Date();
    const recurrence = buildRecurrence(nextPreset, anchor);
    const input: UpdateTaskInput = { recurrence };
    // Graph requires a due date whenever a recurrence is set; anchor one if missing.
    if (recurrence && !task.dueDate) {
      input.dueDate = startOfDay(anchor);
    }
    void updateTask(db, task.id, input);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TaskControlButton
            icon={<Repeat className="size-4" />}
            label={label ?? "Repeat"}
            isSet={Boolean(label)}
          />
        }
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={preset} onValueChange={setPreset}>
          {recurrencePresets.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaskRepeatControl;
