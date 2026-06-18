import { EventType, type AccountInfo, type IPublicClientApplication } from "@azure/msal-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext, type AuthStatus } from "./auth-context";

interface Props {
  msal: IPublicClientApplication;
  scopes: string[];
  children: React.ReactNode;
}

function AuthProvider({ msal, scopes, children }: Props) {
  const [status, setStatus] = useState<AuthStatus>("initializing");

  useEffect(() => {
    async function initialize() {
      await msal.initialize();
      if (msal.getAllAccounts().length > 0) {
        msal.setActiveAccount(msal.getAllAccounts()[0]);
      }

      await msal.handleRedirectPromise();
    }

    const callbackId = msal.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) {
        const result = event.payload as AccountInfo;
        msal.setActiveAccount(result);
      }
    });

    initialize()
      .then(() => {
        const account = msal.getActiveAccount();
        setStatus(account ? "signedIn" : "signedOut");
      })
      .catch((error) => {
        console.error("Error during MSAL initialization:", error);
        setStatus("signedOut");
      });

    return () => {
      if (callbackId) {
        msal.removeEventCallback(callbackId);
      }
    };
  }, [msal]);

  const signIn = useCallback(() => msal.loginRedirect({ scopes }), [msal, scopes]);

  const value = useMemo(
    () => ({
      account: status === "signedIn" ? msal.getActiveAccount() : null,
      status,
      signIn,
    }),
    [msal, status, signIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
