import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TaskRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { type UpdateTaskInput, updateTask } from "@/features/tasks/data/task-mutations";
import { formatDueDate } from "@/features/tasks/task-format";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import TaskControlButton from "./task-control-button";
import { addDays } from "./task-date-utils";
import TaskMonthCalendar from "./task-month-calendar";

interface Props {
  task: TaskRecord;
}

function TaskDueDateControl({ task }: Props) {
  const db = useDatabase();
  const [open, setOpen] = useState(false);
  const formatted = formatDueDate(task.dueDate);

  const setDueDate = (dueDate: Date | null) => {
    const input: UpdateTaskInput = { dueDate };
    // Recurrence requires a due date in Graph; drop it when the due date is cleared.
    if (!dueDate && task.recurrence) {
      input.recurrence = null;
    }
    void updateTask(db, task.id, input);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <TaskControlButton
            icon={<CalendarDays className="size-4" />}
            label={formatted ? `Due ${formatted}` : "Due date"}
            isSet={Boolean(formatted)}
          />
        }
      />
      <PopoverContent className="w-72">
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setDueDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDueDate(addDays(new Date(), 1))}>
              Tomorrow
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDueDate(addDays(new Date(), 7))}>
              Next week
            </Button>
          </div>
          <TaskMonthCalendar selected={task.dueDate} onSelect={setDueDate} />
          <Button variant="ghost" size="sm" onClick={() => setDueDate(null)}>
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default TaskDueDateControl;
