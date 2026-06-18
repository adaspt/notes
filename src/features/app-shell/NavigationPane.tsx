import { Link } from "@tanstack/react-router";
import { Archive, CalendarClock, Folder, Inbox, ListTodo, Star } from "lucide-react";
import CloudSyncControls from "@/features/cloud-sync/CloudSyncControls";
import { useProjects } from "@/features/notes/use-projects";
import { useTodayTasks } from "@/features/tasks/use-today-tasks";
import { cn } from "@/lib/utils";

function NavigationPane() {
  const { items: todayItems } = useTodayTasks();
  const { projects } = useProjects();

  return (
    <nav className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto px-3 py-4" aria-label="Main">
      <section className="space-y-2">
        <ul className="space-y-1">
          <li>
            <Link
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
              )}
              activeProps={{
                className: "bg-accent font-medium text-accent-foreground",
              }}
              to="/today"
            >
              <ListTodo className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">Today</span>
              <span className="text-xs text-muted-foreground">{todayItems.length}</span>
            </Link>
          </li>
          <li>
            <Link
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
              )}
              activeProps={{
                className: "bg-accent font-medium text-accent-foreground",
              }}
              to="/later"
            >
              <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">Later</span>
            </Link>
          </li>
          <li>
            <Link
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
              )}
              activeProps={{
                className: "bg-accent font-medium text-accent-foreground",
              }}
              to="/backlog"
            >
              <Archive className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">Backlog</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="px-3 text-xs font-medium text-muted-foreground">Notes</h2>
        <ul className="space-y-1">
          <li>
            <Link
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
              )}
              activeProps={{
                className: "bg-accent font-medium text-accent-foreground",
              }}
              to="/notes/inbox"
            >
              <Inbox className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">Inbox</span>
            </Link>
          </li>
          <li>
            <Link
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
              )}
              activeProps={{
                className: "bg-accent font-medium text-accent-foreground",
              }}
              to="/notes/starred"
            >
              <Star className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">Starred</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="px-3 text-xs font-medium text-muted-foreground">Projects</h2>
        <ul className="space-y-1">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                className={cn(
                  "flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-muted-foreground",
                  "hover:bg-accent hover:text-accent-foreground",
                )}
                activeProps={{
                  className: "bg-accent font-medium text-accent-foreground",
                }}
                to="/notes/$projectId"
                params={{ projectId: project.id }}
              >
                <Folder className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CloudSyncControls />
    </nav>
  );
}

export default NavigationPane;
