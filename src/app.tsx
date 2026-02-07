import { Route, Routes } from 'react-router';
import AppLayout from './components/shell/app-layout';
import NoteDetails from './components/notes/note-details';
import TasksLayout from './pages/tasks/tasks-layout';
import NotesLayout from './pages/notes/notes-layout';

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
