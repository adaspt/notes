import { FC, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { protectedResources } from './authConfig';

interface Props {}

const CallApi: FC<Props> = ({}) => {
  const { instance: msal, accounts } = useMsal();
  const [data, setData] = useState('');

  useEffect(() => {
    const request = async () => {
      console.log('START');
      try {
        const token = await msal.acquireTokenSilent({
          scopes: protectedResources.graphMe.scopes,
          account: accounts[0]
        });
        const response = await fetch(protectedResources.graphMe.endpoint, {
          headers: { Authorization: `Bearer ${token.accessToken}` }
        });
        const result = await response.json();

        setData(result);
      } catch (ex) {
        console.error('ERROR', ex);
      }
    };

    request();
  }, []);

  return <pre>{JSON.stringify(data, undefined, 2)}</pre>;
};

export default CallApi;
