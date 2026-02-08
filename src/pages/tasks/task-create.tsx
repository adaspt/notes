import { useNavigate, useParams } from 'react-router';
import { formatDateLocal } from '@/lib/dates';
import type { Task } from '@/model/tasks';
import { useTasksRepository } from '@/providers/tasksRepository';
import { useSyncScheduleService } from '@/providers/syncScheduleService';
import TaskForm from '@/features/task-form/task-form';

function TaskCreate() {
  const tasksRepository = useTasksRepository();
  const syncScheduleService = useSyncScheduleService();
  const navigate = useNavigate();
  const { tasks } = useParams();

  const task: Task = {
    id: -1,
    graphId: null,
    title: '',
    importance: 'normal',
    status: tasks === 'backlog' ? 'deferred' : 'notStarted',
    startDateTime:
      tasks === 'later' ? formatDateLocal(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()) : null,
    dueDateTime: null,
    completedDateTime: null,
    createdDateTime: new Date().toISOString(),
    lastModifiedDateTime: new Date().toISOString(),
    body: null,
    checkListItems: [],
    isDeleted: 0,
    isDirty: 0
  };

  const handleSave = async (updatedTask: Task) => {
    const taskId = await tasksRepository.createTask(updatedTask);
    syncScheduleService.requestSync();
    navigate(`/${tasks}/${taskId}`);
  };

  return <TaskForm task={task} onSave={handleSave} />;
}

export default TaskCreate;
