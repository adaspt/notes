import { FC } from 'react';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import CallApi from './CallApi';
import { loginRequest } from './authConfig';

interface Props {
  msal: PublicClientApplication;
}

const App: FC<Props> = ({ msal }) => {
  return (
    <MsalProvider instance={msal}>
      <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={loginRequest}>
        <CallApi />
      </MsalAuthenticationTemplate>
    </MsalProvider>
  );
};

export default App;
