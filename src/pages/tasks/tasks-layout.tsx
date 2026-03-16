import ListLayout from '@/components/shell/list-layout';
import CreateTaskFab from '@/components/tasks/create-task-fab';
import TaskList from '@/features/task-list/task-list';

function TasksLayout() {
  return (
    <ListLayout>
      <TaskList />
      <CreateTaskFab />
    </ListLayout>
  );
}

export default TasksLayout;
