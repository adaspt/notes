import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createStandardPublicClientApplication, InteractionType, type RedirectRequest } from '@azure/msal-browser';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { BrowserRouter } from 'react-router';
import { GraphProvider } from './providers/graph.ts';
import { createDb, DbProvider } from './providers/db.ts';
import { GraphDriveService } from './providers/graphDrive.ts';
import { GraphTasksService } from './providers/graphTasks.ts';
import { SyncProvider, SyncService } from './providers/sync.ts';
import { SyncTasksService } from './providers/syncTasks.ts';
import { TasksRepository, TasksRepositoryProvider } from './providers/tasksRepository.ts';
import './index.css';
import App from './App.tsx';
import { SyncNotesService } from './providers/syncNotes.ts';
import { NotesRepository, NotesRepositoryProvider } from './providers/notesRepository.ts';

const msal = await createStandardPublicClientApplication({
  auth: {
    clientId: 'c0852a00-aa81-4963-a61d-a8a314dae18b',
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: window.location.origin
  }
});

const authenticationRequest: RedirectRequest = {
  scopes: ['https://graph.microsoft.com/.default']
};

const graph = Client.init({
  authProvider: (done) => {
    msal
      .acquireTokenSilent({
        account: msal.getActiveAccount() || undefined,
        scopes: authenticationRequest.scopes
      })
      .then(
        (response) => done(null, response.accessToken),
        (error) => done(error, null)
      );
  }
});

const db = createDb();
const tasksRepository = new TasksRepository(db);
const notesRepository = new NotesRepository(db);
const graphTasksService = new GraphTasksService(graph);
const graphDriveService = new GraphDriveService(graph);
const syncTasksService = new SyncTasksService(tasksRepository, graphTasksService);
const syncNotesService = new SyncNotesService(notesRepository, graphDriveService);
const syncService = new SyncService(syncTasksService, syncNotesService);

function MsalAccount({ children }: { children: ReactNode }) {
  if (!msal.getActiveAccount()) {
    const accounts = msal.getAllAccounts();
    if (accounts.length > 0) {
      msal.setActiveAccount(accounts[0]);
    }
  }

  return children;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msal}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={authenticationRequest}
      >
        <MsalAccount>
          <DbProvider db={db}>
            <TasksRepositoryProvider value={tasksRepository}>
              <NotesRepositoryProvider value={notesRepository}>
                <GraphProvider client={graph}>
                  <SyncProvider syncService={syncService}>
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </SyncProvider>
                </GraphProvider>
              </NotesRepositoryProvider>
            </TasksRepositoryProvider>
          </DbProvider>
        </MsalAccount>
      </MsalAuthenticationTemplate>
    </MsalProvider>
  </StrictMode>
);
