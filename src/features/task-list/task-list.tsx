import { Link, useMatch, useParams } from 'react-router';
import { SquareCheckBigIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import type { Task } from '@/model/tasks';
import { useTasksRepository } from '@/providers/tasksRepository';
import { useIsMobile } from '@/hooks/use-mobile';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { ItemGroup } from '@/components/ui/item';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const getTitle = (filter: string) => {
  switch (filter) {
    case 'later':
      return 'Later';
    case 'backlog':
      return 'Backlog';
    default:
      return 'Today';
  }
};

const byFolder = (filter: string) => {
  const now = new Date();

  return (task: Task) => {
    if (task.isDeleted) {
      return false;
    }

    if (filter === 'later') {
      return (
        (task.status === 'notStarted' || task.status === 'inProgress' || task.status === 'waitingOnOthers') &&
        task.dueDateTime &&
        new Date(task.dueDateTime) > now
      );
    }

    if (filter === 'backlog') {
      return task.status === 'deferred';
    }

    return (
      (task.status === 'notStarted' || task.status === 'inProgress' || task.status === 'waitingOnOthers') &&
      (!task.dueDateTime || new Date(task.dueDateTime) <= now)
    );
  };
};

function TaskList() {
  const isMobile = useIsMobile();
  const tasksRepository = useTasksRepository();

  const isTasks = useMatch('/:tasks?');
  const { tasks: tasksFilter = 'today', taskId } = useParams();

  const tasks = useLiveQuery(
    () => tasksRepository.getTasksByStatuses(['notStarted', 'inProgress', 'waitingOnOthers', 'deferred']),
    []
  );

  const isLoadingTasks = tasks === undefined;
  const activeTasks = (tasks ?? []).filter(byFolder(tasksFilter)).toSorted((a, b) => {
    if (tasksFilter === 'today' && a.importance !== b.importance) {
      if (a.importance === 'high') return -1;
      if (b.importance === 'high') return 1;
      if (a.importance === 'normal') return -1;
      return 1;
    }

    return new Date(a.dueDateTime || '9999-12-31').getTime() - new Date(b.dueDateTime || '9999-12-31').getTime();
  });

  return (
    <div className={cn('border-r w-md sm:w-xs max-w-dvw h-dvh flex flex-col', isMobile && !isTasks ? 'hidden' : '')}>
      <div className="border-b flex items-center p-2 gap-1">
        <SidebarTrigger />
        <span className="text-base font-medium">{getTitle(tasksFilter)}</span>
      </div>
      <ItemGroup className="min-h-0 overflow-y-auto gap-2 p-2">
        {activeTasks.map((task) => (
          <Item key={task.id} variant="outline" className={cn({ 'bg-accent': task.id === Number(taskId) })} asChild>
            <Link to={`/${tasksFilter}/${task.id}`}>
              <ItemContent>
                <ItemTitle>{task.title}</ItemTitle>
                <ItemDescription>
                  {task.importance === 'high' ? '🔥 Important, ' : ''}
                  Due: {task.dueDateTime ? new Date(task.dueDateTime).toLocaleDateString() : 'no due date'}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        ))}
        {!isLoadingTasks && activeTasks.length === 0 && (
          <div className="flex flex-col items-center m-8">
            <SquareCheckBigIcon className="text-muted-foreground/50" size={96} />
            <div className="text-sm text-muted-foreground">No tasks</div>
          </div>
        )}
        {isMobile && tasksFilter != 'today' && (
          <Button variant="secondary" asChild>
            <Link to="/">Today</Link>
          </Button>
        )}
        {isMobile && tasksFilter != 'later' && (
          <Button variant="secondary" asChild>
            <Link to="/later">Later</Link>
          </Button>
        )}
        {isMobile && tasksFilter != 'backlog' && (
          <Button variant="secondary" asChild>
            <Link to="/backlog">Backlog</Link>
          </Button>
        )}
        {isMobile && (
          <Button variant="secondary" asChild>
            <Link to="/notes">Recent notes</Link>
          </Button>
        )}
      </ItemGroup>
    </div>
  );
}

export default TaskList;
