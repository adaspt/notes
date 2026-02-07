import ListLayout from '@/components/shell/ListLayout';
import TaskList from '@/features/task-list/task-list';

function TasksLayout() {
  return (
    <ListLayout>
      <TaskList />
    </ListLayout>
  );
}

export default TasksLayout;
