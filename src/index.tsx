import React from 'react';
import ReactDOM from 'react-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { QueryClient } from 'react-query';
import { msalConfig } from './authConfig';
import App from './App';

const msal = new PublicClientApplication(msalConfig);
const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <App msal={msal} queryClient={queryClient} />
  </React.StrictMode>,
  document.getElementById('root')
);
