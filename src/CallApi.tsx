import { FC, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { protectedResources } from './authConfig';

const CallApi: FC = () => {
  const { instance: msal, accounts } = useMsal();
  const [data, setData] = useState('');

  useEffect(() => {
    const request = async () => {
      try {
        const token = await msal.acquireTokenSilent({
          scopes: protectedResources.graphDrive.scopes,
          account: accounts[0]
        });
        const response = await fetch(protectedResources.graphDrive.endpoint, {
          headers: { Authorization: `Bearer ${token.accessToken}` }
        });
        const result = await response.json();

        setData(result);
      } catch (ex) {
        console.error('ERROR', ex);
      }
    };

    request();
  }, [accounts, msal]);

  return <pre>{JSON.stringify(data, undefined, 2)}</pre>;
};

export default CallApi;
