import { useNavigate, useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Task } from '@/model/tasks';
import { useTasksRepository } from '@/providers/tasksRepository';
import { useSyncScheduleService } from '@/providers/syncScheduleService';
import TaskForm from '@/features/task-form/task-form';

function TaskDetails() {
  const tasksRepository = useTasksRepository();
  const syncScheduleService = useSyncScheduleService();
  const navigate = useNavigate();
  const { taskId, tasks } = useParams();

  const task = useLiveQuery(() => tasksRepository.getById(Number(taskId ?? -1)), [taskId]);

  if (!task) {
    return <div className="p-4 text-sm text-muted-foreground">Loading task...</div>;
  }

  const handleSave = async (updatedTask: Task) => {
    await tasksRepository.updateTask(updatedTask);
    syncScheduleService.requestSync();
  };

  const handleComplete = async (updatedTask: Task) => {
    await tasksRepository.updateTask(updatedTask);
    syncScheduleService.requestSync();
    navigate(`/${tasks || 'today'}`, { replace: true });
  };

  const handleMove = async (updatedTask: Task) => {
    await tasksRepository.updateTask(updatedTask);
    syncScheduleService.requestSync();
    navigate(`/${tasks || 'today'}`, { replace: true });
  };

  return <TaskForm key={task.id} task={task} onSave={handleSave} onComplete={handleComplete} onMove={handleMove} />;
}

export default TaskDetails;
