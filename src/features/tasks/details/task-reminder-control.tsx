import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TaskRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateTask } from "@/features/tasks/data/task-mutations";
import { formatReminder } from "@/features/tasks/task-format";
import { Bell } from "lucide-react";
import { useState } from "react";
import TaskControlButton from "./task-control-button";
import { addDays, fromDateTimeInputValue, toDateTimeInputValue } from "./task-date-utils";

interface Props {
  task: TaskRecord;
}

function TaskReminderControl({ task }: Props) {
  const db = useDatabase();
  const [open, setOpen] = useState(false);
  const formatted = formatReminder(task.reminder);

  const setReminder = (reminder: Date | null) => {
    void updateTask(db, task.id, { reminder });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <TaskControlButton
            icon={<Bell className="size-4" />}
            label={formatted ?? "Remind me"}
            isSet={Boolean(formatted)}
          />
        }
      />
      <PopoverContent className="w-72">
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReminder(atTime(new Date(), 18, 0))}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReminder(atTime(addDays(new Date(), 1), 9, 0))}
            >
              Tomorrow
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReminder(atTime(addDays(new Date(), 7), 9, 0))}
            >
              Next week
            </Button>
          </div>
          <input
            type="datetime-local"
            value={toDateTimeInputValue(task.reminder)}
            onChange={(event) => setReminder(fromDateTimeInputValue(event.target.value))}
            className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button variant="ghost" size="sm" onClick={() => setReminder(null)}>
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function atTime(date: Date, hours: number, minutes: number) {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export default TaskReminderControl;
