import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { InteractionType, createStandardPublicClientApplication } from '@azure/msal-browser';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

import './styles.css';
import reportWebVitals from './reportWebVitals.ts';

// Authentication
const msal = await createStandardPublicClientApplication({
  auth: {
    clientId: 'c0852a00-aa81-4963-a61d-a8a314dae18b',
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: window.location.origin
  }
});

// Graph API
const graph = Client.init({
  authProvider: (callback) => {
    msal
      .acquireTokenSilent({
        account: msal.getAllAccounts()[0],
        scopes: ['https://graph.microsoft.com/.default']
      })
      .then(
        (response) => callback(null, response.accessToken),
        (error) => callback(error, null)
      );
  }
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { graph },
  defaultPreload: false,
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultStaleTime: 3600000 // 1 hour
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <MsalProvider instance={msal}>
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect}>
          <RouterProvider router={router} />
        </MsalAuthenticationTemplate>
      </MsalProvider>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
