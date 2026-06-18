import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";
import AuthProvider from "@/lib/auth/AuthProvider.tsx";
import { CloudSyncEngine } from "@/features/cloud-sync/cloud-sync-engine.ts";
import CloudSyncProvider from "@/features/cloud-sync/CloudSyncProvider.tsx";
import "./index.css";
import App from "./App.tsx";

const graphScopes = ["Tasks.ReadWrite", "Files.ReadWrite.AppFolder"];

const msal = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: "https://login.microsoftonline.com/consumers",
    redirectUri: `${window.location.origin}/redirect.html`,
  },
  cache: {
    cacheLocation: "localStorage",
  },
});

const syncEngine = new CloudSyncEngine(msal, graphScopes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider msal={msal} scopes={graphScopes}>
      <CloudSyncProvider syncEngine={syncEngine}>
        <App />
      </CloudSyncProvider>
    </AuthProvider>
  </StrictMode>,
);
