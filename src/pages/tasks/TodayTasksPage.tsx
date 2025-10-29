import { useLiveQuery } from 'dexie-react-hooks';
import type { Task } from '@/model/tasks';
import { useTasksRepository } from '@/providers/tasksRepository';
import { Item, ItemContent } from '@/components/ui/item';
import { Link, Outlet } from 'react-router';

function TodayTasksPage() {
  const tasksRepository = useTasksRepository();

  const data = useLiveQuery(() => tasksRepository.getTodayTasks(), [], [] as Task[]);

  return (
    <div>
      <h1 className="text-2xl font-semibold m-2">Today's Tasks ({data.length})</h1>
      <hr />
      <div className="flex flex-col gap-2 p-2">
        {data.map((task) => (
          <Link key={task.id} to={`/tasks/today/${task.id}`}>
            <Item variant="outline">
              <ItemContent>{task.title}</ItemContent>
            </Item>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}

export default TodayTasksPage;
