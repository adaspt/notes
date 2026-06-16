import CreateActionButton from "@/features/app-shell/CreateActionButton";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

import type { TaskListItem } from "./task-list-format";

type TaskListPaneProps = {
  emptyState: string;
  floatingAction?: ReactNode;
  items: ReadonlyArray<TaskListItem>;
  selectedTaskId?: string;
  showHeader?: boolean;
  title: string;
  onCreateTask?: () => void;
  onSelectTask: (taskId: string) => void;
};

function TaskListPane({
  emptyState,
  floatingAction,
  items,
  selectedTaskId,
  showHeader = true,
  title,
  onCreateTask,
  onSelectTask,
}: TaskListPaneProps) {
  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden" aria-label={title}>
      {showHeader && (
        <header className="flex items-center justify-between gap-3 border-b px-4 py-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          {onCreateTask && (
            <CreateActionButton label="New task" variant="header" onClick={onCreateTask} />
          )}
        </header>
      )}
      <div className="min-h-0 flex-1 overflow-y-scroll [scrollbar-gutter:stable]">
        {items.length > 0 ? (
          <ul className="divide-y">
            {items.map((task) => (
              <li key={task.id}>
                <button
                  className={cn(
                    "block w-full px-4 py-3 text-left hover:bg-accent",
                    selectedTaskId === task.id && "bg-accent",
                  )}
                  type="button"
                  onClick={() => onSelectTask(task.id)}
                >
                  <span className="block truncate text-sm font-medium">{task.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{task.priorityLabel}</span>
                    <span aria-hidden="true">/</span>
                    <span>{task.dueDateLabel}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {emptyState}
          </div>
        )}
      </div>
      {floatingAction}
    </section>
  );
}

export default TaskListPane;
