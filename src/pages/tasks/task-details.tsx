import { useParams } from 'react-router';
import { useTasksRepository } from '@/providers/tasksRepository';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '@/components/ui/button';

function TaskDetails() {
  const tasksRepository = useTasksRepository();
  const { taskId } = useParams();

  const task = useLiveQuery(() => tasksRepository.getById(Number(taskId ?? -1)), [taskId]);

  return (
    <>
      <div className="flex items-center justify-end p-1 gap-2 border-b">
        <Button disabled>Save</Button>
      </div>
      <div className="flex-1 overflow-auto">
        <pre>{JSON.stringify(task, null, 2)}</pre>
      </div>
    </>
  );
}

export default TaskDetails;
