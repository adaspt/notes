import { useMsal } from '@azure/msal-react';
import { QueryKey, useQuery, UseQueryOptions } from 'react-query';
import { protectedResources } from '../authConfig';
import { buildFullUrl, QueryStringValueType } from '../utils/urls';

interface ApiQueryContext {
  signal?: AbortSignal;
  getAccessToken(scopes: string[]): Promise<string>;
}

export const query =
  <T>(queryKey: QueryKey, action: (apiContext: ApiQueryContext) => Promise<T>) =>
  (apiQueryContext: ApiQueryContext): UseQueryOptions<T> => {
    return {
      queryKey,
      queryFn: ({ signal }) => action({ ...apiQueryContext, signal })
    };
  };

export const graphQuery = <T>(url: string, searchParams?: Record<string, QueryStringValueType>) => {
  const queryKey = searchParams
    ? Object.keys(searchParams).reduce((acc, key) => `${acc}/${searchParams[key]}`, url)
    : url;

  return query(queryKey, async ({ signal, getAccessToken }) => {
    const accessToken = await getAccessToken(protectedResources.graph.scopes);

    const fullUrl = buildFullUrl([protectedResources.graph.endpoint, url], searchParams);
    const response = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal
    });

    if (!response.ok) {
      throw new Error(`Http error while executing request (${response.status})`);
    }

    return response.json() as Promise<T>;
  });
};

export const useApiQuery = <T>(apiQueryFactory: (apiQueryContext: ApiQueryContext) => UseQueryOptions<T>) => {
  const { instance: msal, accounts } = useMsal();
  return useQuery(
    apiQueryFactory({
      getAccessToken: (scopes: string[]) =>
        msal.acquireTokenSilent({ scopes, account: accounts[0] }).then((token) => token.accessToken)
    })
  );
};
