import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createStandardPublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { BrowserRouter } from 'react-router';
import { createDb } from './providers/db.ts';
import { SyncService } from './providers/syncService.ts';
import { NotesRepository, NotesRepositoryProvider } from './providers/notesRepository.ts';
import { DriveService, DriveServiceProvider } from './providers/driveService.ts';
import App from './App.tsx';
import { SyncScheduleService, SyncScheduleProvider } from './providers/syncScheduleService.ts';

const msal = await createStandardPublicClientApplication({
  auth: {
    clientId: 'c0852a00-aa81-4963-a61d-a8a314dae18b',
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: window.location.origin
  }
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
const notesRepository = new NotesRepository(db);
const syncService = new SyncService(notesRepository, driveService);
const syncScheduleService = new SyncScheduleService(syncService, 60 * 60 * 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msal}>
      <DriveServiceProvider value={driveService}>
        <NotesRepositoryProvider value={notesRepository}>
          <SyncScheduleProvider value={syncScheduleService}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SyncScheduleProvider>
        </NotesRepositoryProvider>
      </DriveServiceProvider>
    </MsalProvider>
  </StrictMode>
);
