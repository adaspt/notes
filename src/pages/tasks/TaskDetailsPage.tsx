import { useNavigate, useParams } from 'react-router';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useTasksRepository } from '@/providers/tasksRepository';
import { useQuery, type QueryState } from '@/hooks/useQuery';
import type { Task } from '@/model/tasks';

interface Props {
  listTitle: string;
  returnPath: string;
}

function TaskDetailsContent({ task }: { task: QueryState<Task | undefined> }) {
  if (task.loading) return null;
  if (task.error) return <div className="p-4">Error: {task.error.message}</div>;
  if (!task.data) return <div className="p-4">Task not found</div>;

  return (
    <div className="p-4">
      <div className="font-semibold text-lg">{task.data.title}</div>
      {task.data.checkListItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input type="checkbox" checked={item.isChecked} readOnly />
          <span>{item.displayName}</span>
        </div>
      ))}
      <div className="whitespace-pre-wrap">{task.data.body}</div>
      <div>Start: {task.data.startDateTime ? new Date(task.data.startDateTime + 'Z').toLocaleString() : '-'}</div>
      <div>Due: {task.data.dueDateTime ? new Date(task.data.dueDateTime + 'Z').toLocaleDateString() : '-'}</div>
      <div>Importance: {task.data.importance}</div>
      <div>Status: {task.data.status}</div>
    </div>
  );
}

function TaskDetailsPage({ listTitle, returnPath }: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const tasksRepository = useTasksRepository();
  const task = useQuery(() => tasksRepository.getById(Number(params.taskId)));

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate(returnPath);
    }
  };

  return (
    <Sheet defaultOpen onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{listTitle}</SheetTitle>
        </SheetHeader>
        <TaskDetailsContent task={task} />
        <SheetFooter>Footer</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default TaskDetailsPage;
