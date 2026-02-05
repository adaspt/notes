import { Outlet } from 'react-router';
import TaskList from '@/features/task-list/task-list';

function TasksLayout() {
  return (
    <>
      <TaskList />
      <main className="bg-background relative flex flex-col w-full flex-1 h-svh min-w-0">
        <Outlet />
      </main>
    </>
  );
}

export default TasksLayout;
