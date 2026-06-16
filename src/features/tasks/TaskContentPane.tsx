import type { ReactNode } from "react";

import type { TaskDetailViewModel } from "./task-detail-format";

type TaskContentPaneProps =
  | {
      actions?: ReactNode;
      detail: TaskDetailViewModel;
    }
  | {
      detail?: undefined;
      emptyState: string;
    };

function TaskContentPane(props: TaskContentPaneProps) {
  if (!props.detail) {
    return (
      <section
        className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground"
        aria-label="Task details"
      >
        {props.emptyState}
      </section>
    );
  }

  const { actions, detail } = props;

  return (
    <article className="h-full overflow-y-auto px-6 py-5" aria-label="Task details">
      <header className="space-y-2 border-b pb-5">
        <p className="text-xs font-medium text-muted-foreground">{detail.priorityLabel}</p>
        <h2 className="text-2xl font-semibold">{detail.title}</h2>
        <p className="text-sm text-muted-foreground">{detail.dueDateLabel}</p>
        {actions && <div className="pt-3">{actions}</div>}
      </header>
      <dl className="grid gap-4 border-b py-5 sm:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-xs font-medium text-muted-foreground">Status</dt>
          <dd className="text-sm">{detail.statusLabel}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-muted-foreground">Priority</dt>
          <dd className="text-sm">{detail.priorityLabel}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-muted-foreground">Due date</dt>
          <dd className="text-sm">{detail.dueDateLabel}</dd>
        </div>
      </dl>
      {detail.notesBody && (
        <section className="py-5">
          <h3 className="text-sm font-medium">Notes</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {detail.notesBody}
          </p>
        </section>
      )}
    </article>
  );
}

export default TaskContentPane;
