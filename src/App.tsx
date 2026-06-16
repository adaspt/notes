import { RouterProvider } from "@tanstack/react-router";

import MicrosoftSyncProvider from "./features/microsoft-sync/MicrosoftSyncProvider";
import { router } from "./router";

function App() {
  return (
    <MicrosoftSyncProvider>
      <RouterProvider router={router} />
    </MicrosoftSyncProvider>
  );
}

export default App;
