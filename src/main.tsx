import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createStandardPublicClientApplication,
  EventType,
  type AccountInfo,
} from "@azure/msal-browser";
import MicrosoftSyncProvider from "./features/microsoft-sync/MicrosoftSyncProvider";
import "./index.css";
import App from "./App.tsx";

const msal = await createStandardPublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: "https://login.microsoftonline.com/consumers",
    redirectUri: `${window.location.origin}/redirect.html`,
  },
  cache: {
    cacheLocation: "localStorage",
  },
});

await msal.handleRedirectPromise();

const accounts = msal.getAllAccounts();
if (accounts.length > 0) {
  msal.setActiveAccount(accounts[0]);
}

msal.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    const result = event.payload as AccountInfo;
    msal.setActiveAccount(result);
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MicrosoftSyncProvider msal={msal}>
      <App />
    </MicrosoftSyncProvider>
  </StrictMode>,
);
