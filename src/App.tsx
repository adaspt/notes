import { FC } from 'react';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import { QueryClient, QueryClientProvider } from 'react-query';
import CallApi from './CallApi';
import { loginRequest } from './authConfig';

interface Props {
  msal: PublicClientApplication;
  queryClient: QueryClient;
}

const App: FC<Props> = ({ msal, queryClient }) => {
  return (
    <MsalProvider instance={msal}>
      <QueryClientProvider client={queryClient}>
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={loginRequest}>
          <CallApi />
        </MsalAuthenticationTemplate>
      </QueryClientProvider>
    </MsalProvider>
  );
};

export default App;
