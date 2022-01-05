import React from 'react';
import ReactDOM from 'react-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig';
import App from './App';

const msal = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <React.StrictMode>
    <App msal={msal} />
  </React.StrictMode>,
  document.getElementById('root')
);
