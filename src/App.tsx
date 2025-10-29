import { Navigate, Route, Routes } from 'react-router';
import AppLayout from './components/shell/AppLayout';
import TodayTasksPage from './pages/tasks/TodayTasksPage';
import TaskDetailsPage from './pages/tasks/TaskDetailsPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate replace to="/tasks/today" />} />
        <Route path="tasks">
          <Route path="today" element={<TodayTasksPage />}>
            <Route path=":taskId" element={<TaskDetailsPage listTitle="Today" returnPath="/tasks/today" />} />
          </Route>
          <Route path="later" element={<div>Later's Tasks</div>} />
          <Route path="someday" element={<div>Someday's Tasks</div>} />
        </Route>
        <Route path="*" element={<div>Not Found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
