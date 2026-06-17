import {
  BrowserAuthErrorCodes,
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type Configuration,
} from "@azure/msal-browser";

const microsoftGraphScopes = ["Tasks.ReadWrite", "Files.ReadWrite.AppFolder"] as const;

type MicrosoftAuthEnvironment = {
  clientId: string;
  authority?: string;
  redirectUri?: string;
};

type MicrosoftAuthSession = {
  account: AccountInfo | null;
  accountCount: number;
  client: PublicClientApplication;
  redirectHandled: boolean;
};

let microsoftAuthSessionPromise: Promise<MicrosoftAuthSession | null> | null = null;

function createMicrosoftAuthConfig(environment: MicrosoftAuthEnvironment): Configuration {
  return {
    auth: {
      clientId: environment.clientId,
      authority: environment.authority ?? "https://login.microsoftonline.com/consumers",
      redirectUri: environment.redirectUri ?? getDefaultRedirectUri(),
    },
    cache: {
      cacheLocation: "localStorage",
    },
  };
}

function getMicrosoftAuthEnvironment(): MicrosoftAuthEnvironment | null {
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  if (!clientId) {
    return null;
  }

  return {
    clientId,
    authority: import.meta.env.VITE_MICROSOFT_AUTHORITY,
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI,
  };
}

function createMicrosoftAuthClient(environment = getMicrosoftAuthEnvironment()) {
  if (!environment) {
    return null;
  }

  return new PublicClientApplication(createMicrosoftAuthConfig(environment));
}

export function initializeMicrosoftAuthSession() {
  microsoftAuthSessionPromise ??= createMicrosoftAuthSession();
  return microsoftAuthSessionPromise;
}

function getActiveMicrosoftAccount(client: PublicClientApplication): AccountInfo | null {
  return client.getActiveAccount() ?? client.getAllAccounts()[0] ?? null;
}

export async function signInWithMicrosoft(client: PublicClientApplication) {
  await client.loginRedirect({
    scopes: [...microsoftGraphScopes],
  });
}

export async function acquireMicrosoftGraphToken(
  client: PublicClientApplication,
  account: AccountInfo,
) {
  try {
    const result = await client.acquireTokenSilent({
      account,
      scopes: [...microsoftGraphScopes],
    });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const result = await client.acquireTokenPopup({
        account,
        scopes: [...microsoftGraphScopes],
      });

      if (result.account) {
        client.setActiveAccount(result.account);
      }

      return result.accessToken;
    }

    throw error;
  }
}

function getDefaultRedirectUri() {
  return globalThis.location?.origin ?? "/";
}

async function createMicrosoftAuthSession(): Promise<MicrosoftAuthSession | null> {
  const client = createMicrosoftAuthClient();
  if (!client) {
    return null;
  }

  await client.initialize();

  const redirectResult = await handleMicrosoftRedirectResult(client);
  const accounts = client.getAllAccounts();
  const account = redirectResult?.account ?? getActiveMicrosoftAccount(client);

  if (account) {
    client.setActiveAccount(account);
  }

  return {
    account,
    accountCount: accounts.length,
    client,
    redirectHandled: redirectResult !== null,
  };
}

async function handleMicrosoftRedirectResult(client: PublicClientApplication) {
  try {
    return await client.handleRedirectPromise();
  } catch (error) {
    if (getMsalErrorCode(error) === BrowserAuthErrorCodes.noTokenRequestCacheError) {
      return null;
    }

    throw error;
  }
}

function getMsalErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("errorCode" in error)) {
    return null;
  }

  const errorCode = error.errorCode;
  return typeof errorCode === "string" ? errorCode : null;
}
