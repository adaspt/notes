import { FC } from 'react';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';

interface Props {
  msal: PublicClientApplication;
}

const App: FC<Props> = ({ msal }) => {
  return (
    <MsalProvider instance={msal}>
      <MsalAuthenticationTemplate interactionType={InteractionType.Redirect}>Hello MSAL</MsalAuthenticationTemplate>
    </MsalProvider>
  );
};

export default App;
