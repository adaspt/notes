import ListCreateButton from "@/components/list-pane/list-create-button";
import ListPane from "@/components/list-pane/list-pane";
import ListPaneContent from "@/components/list-pane/list-pane-content";
import ListPaneHeader from "@/components/list-pane/list-pane-header";
import ListPaneMenu from "@/components/list-pane/list-pane-menu";
import ListPaneMenuItem from "@/components/list-pane/list-pane-menu-item";
import type { TaskRecord } from "@/data/schemas";
import { cn } from "@/lib/utils";
import { Link, type LinkProps } from "@tanstack/react-router";
import { formatDueDate, formatPriority } from "../task-format";

interface Props {
  title: string;
  items: TaskRecord[];
  getLinkOptions: (item: TaskRecord) => LinkProps;
  onCreate: () => void;
}

function TaskListPane({ title, items, getLinkOptions, onCreate }: Props) {
  return (
    <ListPane>
      <ListPaneHeader title={title}>
        <ListCreateButton onClick={onCreate} label="New task" />
      </ListPaneHeader>
      <ListPaneContent>
        {items.length > 0 && (
          <ListPaneMenu>
            {items.map((x) => (
              <ListPaneMenuItem key={x.id}>
                <Link
                  className="block w-full px-4 py-3 hover:bg-accent"
                  activeProps={{ className: "bg-accent" }}
                  {...getLinkOptions(x)}
                >
                  <span className="block truncate text-sm font-medium">{x.title}</span>
                  <span className="mt-1 flex gap-2 text-xs text-muted-foreground">
                    <span className={cn(x.priority === "high" && "font-medium text-destructive")}>
                      {formatPriority(x.priority)} priority
                    </span>
                    {x.dueDate && (
                      <>
                        <span aria-hidden="true">/</span>
                        <span>Due {formatDueDate(x.dueDate)}</span>
                      </>
                    )}
                  </span>
                </Link>
              </ListPaneMenuItem>
            ))}
          </ListPaneMenu>
        )}
      </ListPaneContent>
    </ListPane>
  );
}

export default TaskListPane;
