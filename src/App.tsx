import { Route, Routes } from 'react-router';
import AppLayout from './components/shell/AppLayout';
import NoteDetails from './components/notes/NoteDetails';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path=":vaultId?">
          <Route path=":projectId?">
            <Route index />
            <Route path=":noteId" element={<NoteDetails />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
