import { Link, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { useTasksRepository } from '@/providers/tasksRepository';
import { useIsMobile } from '@/hooks/use-mobile';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { ItemGroup } from '@/components/ui/item';
import { SidebarTrigger } from '@/components/ui/sidebar';

function TaskList() {
  const isMobile = useIsMobile();
  const tasksRepository = useTasksRepository();

  const { tasks: tasksFilter = 'today', taskId } = useParams();

  const tasks = useLiveQuery(
    () => tasksRepository.getTasksByStatuses(['notStarted', 'inProgress', 'waitingOnOthers']),
    [],
    []
  );

  const activeTasks = tasks
    .filter((x) => !x.isDeleted && (!x.startDateTime || new Date(x.startDateTime) >= new Date()))
    .toSorted((a, b) => {
      if (a.importance !== b.importance) {
        if (a.importance === 'high') return -1;
        if (b.importance === 'high') return 1;
        if (a.importance === 'normal') return -1;
        return 1;
      }

      return new Date(a.createdDateTime).getTime() - new Date(b.createdDateTime).getTime();
    });

  return (
    <div className={cn('border-r w-md sm:w-xs max-w-dvw h-dvh flex flex-col', isMobile && taskId ? 'hidden' : '')}>
      <div className="border-b flex items-center p-2 gap-1">
        <SidebarTrigger />
        <span className="text-base font-medium">{tasksFilter === 'today' ? 'Today' : 'All'}</span>
      </div>
      <ItemGroup className="min-h-0 overflow-y-auto gap-2 p-2">
        {activeTasks.map((task) => (
          <Item key={task.id} variant="outline" className={cn({ 'bg-accent': task.id === Number(taskId) })} asChild>
            <Link to={`/${tasksFilter}/${task.id}`}>
              <ItemContent>
                <ItemTitle>{task.title}</ItemTitle>
                <ItemDescription>
                  Start: {task.startDateTime ? new Date(task.startDateTime).toLocaleDateString() : 'No start date'},
                  Due: {task.dueDateTime ? new Date(task.dueDateTime).toLocaleDateString() : 'No due date'}
                  <br />
                  Importance: {task.importance}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}

export default TaskList;
