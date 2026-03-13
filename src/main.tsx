import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { createStandardPublicClientApplication, EventType, type AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { BrowserRouter } from 'react-router';
import { createDb } from './providers/db.ts';
import { SyncService } from './providers/syncService.ts';
import { NotesRepository, NotesRepositoryProvider } from './providers/notesRepository.ts';
import { TasksRepository, TasksRepositoryProvider } from './providers/tasksRepository.ts';
import { DriveService, DriveServiceProvider } from './providers/driveService.ts';
import { TodoService } from './providers/todoService.ts';
import { SyncScheduleService, SyncScheduleProvider } from './providers/syncScheduleService.ts';
import AppError from './components/shell/app-error';
import App from './app';

const msal = await createStandardPublicClientApplication({
  auth: {
    clientId: 'c0852a00-aa81-4963-a61d-a8a314dae18b',
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: `${window.origin}/redirect.html`
  }
});

msal.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    const result = event.payload as AuthenticationResult | null;
    if (result?.account) {
      msal.setActiveAccount(result.account);
    }
  }
});

msal.ssoSilent({ scopes: ['https://graph.microsoft.com/.default'] }).catch((error) => {
  console.warn('Silent SSO failed', error);
});

const graph = Client.init({
  authProvider: (done) => {
    msal
      .acquireTokenSilent({
        account: msal.getActiveAccount() || msal.getAllAccounts()[0],
        scopes: ['https://graph.microsoft.com/.default']
      })
      .then(
        (response) => done(null, response.accessToken),
        (error) => done(error, null)
      );
  }
});

const db = createDb();
const driveService = new DriveService(graph);
const todoService = new TodoService(graph);
const notesRepository = new NotesRepository(db);
const tasksRepository = new TasksRepository(db);
const syncService = new SyncService(notesRepository, tasksRepository, driveService, todoService);
const syncScheduleService = new SyncScheduleService(syncService, 60 * 60 * 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={AppError}>
      <MsalProvider instance={msal}>
        <DriveServiceProvider value={driveService}>
          <NotesRepositoryProvider value={notesRepository}>
            <TasksRepositoryProvider value={tasksRepository}>
              <SyncScheduleProvider value={syncScheduleService}>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </SyncScheduleProvider>
            </TasksRepositoryProvider>
          </NotesRepositoryProvider>
        </DriveServiceProvider>
      </MsalProvider>
    </ErrorBoundary>
  </StrictMode>
);
