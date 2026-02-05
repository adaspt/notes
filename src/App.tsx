import { Route, Routes } from 'react-router';
import AppLayout from './components/shell/AppLayout';
import NoteDetails from './components/notes/NoteDetails';
import TasksLayout from './pages/tasks/TasksLayout';
import NotesLayout from './pages/notes/NotesLayout';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path=":tasks?" element={<TasksLayout />}>
          <Route index element={null} />
          <Route path=":taskId" element={null} />
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
