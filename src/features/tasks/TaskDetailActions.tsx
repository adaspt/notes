import {
  Archive,
  Calendar,
  CalendarClock,
  CalendarPlus,
  Check,
  ChevronDown,
  Edit,
  MoveRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import {
  completeTask,
  deferTaskToBacklog,
  moveTaskToNextMonth,
  moveTaskToNextWeek,
  moveTaskToToday,
  moveTaskToTomorrow,
} from "./task-mutations";

type TaskDetailActionsProps = {
  taskId: string;
  onEdit: () => void;
};

type TaskAction = {
  icon: typeof Check;
  label: string;
  run: (taskId: string) => Promise<unknown>;
};

const completeAction: TaskAction = {
  icon: Check,
  label: "Complete",
  run: completeTask,
};

const scheduleActions: TaskAction[] = [
  {
    icon: Calendar,
    label: "Today",
    run: moveTaskToToday,
  },
  {
    icon: MoveRight,
    label: "Tomorrow",
    run: moveTaskToTomorrow,
  },
  {
    icon: CalendarClock,
    label: "Next Week",
    run: moveTaskToNextWeek,
  },
  {
    icon: CalendarPlus,
    label: "Next Month",
    run: moveTaskToNextMonth,
  },
  {
    icon: Archive,
    label: "Backlog",
    run: deferTaskToBacklog,
  },
];

function TaskDetailActions({ taskId, onEdit }: TaskDetailActionsProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScheduleMenuOpen, setIsScheduleMenuOpen] = useState(false);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const scheduleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isScheduleMenuOpen) {
      return;
    }

    function closeMenuOnOutsidePointerDown(event: PointerEvent) {
      if (!scheduleMenuRef.current?.contains(event.target as Node)) {
        setIsScheduleMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenuOnOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsidePointerDown);
    };
  }, [isScheduleMenuOpen]);

  function runAction(action: TaskAction) {
    setErrorMessage(null);
    setRunningAction(action.label);
    void action
      .run(taskId)
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)))
      .finally(() => setRunningAction(null));
  }

  const CompleteIcon = completeAction.icon;
  const activeScheduleAction = scheduleActions.find((action) => action.label === runningAction);

  return (
    <div className="space-y-2" aria-label="Task actions">
      <div className="flex flex-wrap gap-2">
        <button
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium",
            "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
          )}
          type="button"
          disabled={runningAction !== null}
          onClick={onEdit}
        >
          <Edit className="size-4" aria-hidden="true" />
          Edit
        </button>
        <button
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium",
            "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
          )}
          type="button"
          disabled={runningAction !== null}
          onClick={() => runAction(completeAction)}
        >
          <CompleteIcon className="size-4" aria-hidden="true" />
          {runningAction === completeAction.label ? "Updating" : completeAction.label}
        </button>
        <div className="relative" ref={scheduleMenuRef}>
          <button
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium",
              "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
            )}
            type="button"
            aria-expanded={isScheduleMenuOpen}
            aria-haspopup="menu"
            disabled={runningAction !== null}
            onClick={() => setIsScheduleMenuOpen((isOpen) => !isOpen)}
          >
            <CalendarClock className="size-4" aria-hidden="true" />
            {activeScheduleAction ? "Updating" : "Schedule"}
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
          {isScheduleMenuOpen && (
            <div
              className="absolute left-0 top-full z-20 mt-1 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              role="menu"
            >
              {scheduleActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    className={cn(
                      "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-xs font-medium",
                      "hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                    )}
                    type="button"
                    role="menuitem"
                    disabled={runningAction !== null}
                    onClick={() => {
                      setIsScheduleMenuOpen(false);
                      runAction(action);
                    }}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {runningAction === action.label ? "Updating" : action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Task update failed.";
}

export default TaskDetailActions;
