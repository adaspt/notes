import { Route, Routes } from 'react-router';
import AppLayout from './pages/app-layout';
import TasksLayout from './pages/tasks/tasks-layout';
import TaskCreate from './pages/tasks/task-create';
import TaskDetails from './pages/tasks/task-details';
import NotesLayout from './pages/notes/notes-layout';
import NoteDetails from './pages/notes/note-details';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path=":tasks?" element={<TasksLayout />}>
          <Route index element={null} />
          <Route path="create" element={<TaskCreate />} />
          <Route path=":taskId" element={<TaskDetails />} />
        </Route>
        <Route path="notes/:folderId" element={<NotesLayout />}>
          <Route index element={null} />
          <Route path=":noteId" element={<NoteDetails />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
