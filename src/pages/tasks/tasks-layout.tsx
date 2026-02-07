import ListLayout from '@/components/shell/list-layout';
import TaskList from '@/features/task-list/task-list';

function TasksLayout() {
  return (
    <ListLayout>
      <TaskList />
    </ListLayout>
  );
}

export default TasksLayout;
