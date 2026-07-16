import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { createStandardPublicClientApplication } from "@azure/msal-browser";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { GraphClient } from "@/lib/graph/graph-client";
import { Database } from "@/data/database";
import DatabaseProvider from "@/data/database-provider";
import { Session } from "@/features/auth/session";
import SessionProvider from "@/features/auth/session-provider";
import { Sync } from "@/features/sync/sync";
import SyncProvider from "@/features/sync/sync-provider";
import "./index.css";
import App from "./app";

// Register the service worker for PWA installability + offline app-shell caching.
registerSW({ immediate: true });

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    enableUnhandledPromiseRejectionTracking: true,
  },
});
appInsights.loadAppInsights();

const graphScopes = ["Tasks.ReadWrite", "Files.ReadWrite.AppFolder"];

const msal = await createStandardPublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: import.meta.env.VITE_MICROSOFT_AUTHORITY,
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",
  },
});

const db = new Database();
const session = new Session(msal, graphScopes);
const graph = new GraphClient(session);
const sync = new Sync(db, graph);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DatabaseProvider db={db}>
      <SessionProvider session={session}>
        <SyncProvider sync={sync}>
          <App />
        </SyncProvider>
      </SessionProvider>
    </DatabaseProvider>
  </StrictMode>,
);
