import { useMsal } from '@azure/msal-react';
import { QueryKey, useQuery, UseQueryOptions } from 'react-query';
import { protectedResources } from '../authConfig';
import { buildFullUrl, QueryStringParams } from '../utils/urls';

interface ApiQueryContext {
  signal?: AbortSignal;
  getAccessToken(scopes: string[]): Promise<string>;
}

type ApiQueryFactory<T> = (apiQueryContext: ApiQueryContext) => UseQueryOptions<T>;

export const query =
  <T>(queryKey: QueryKey, action: (apiContext: ApiQueryContext) => Promise<T>): ApiQueryFactory<T> =>
  (apiQueryContext) => {
    return {
      queryKey,
      queryFn: ({ signal }) => action({ ...apiQueryContext, signal })
    };
  };

export function graphQuery<T>(url: string, searchParams?: QueryStringParams | null | undefined): ApiQueryFactory<T>;
export function graphQuery<D, T>(
  url: string,
  searchParams: QueryStringParams | null | undefined,
  mapper: (dto: D) => T
): ApiQueryFactory<T>;
export function graphQuery<D, T>(
  url: string,
  searchParams: QueryStringParams | null | undefined,
  mapper?: (dto: D) => T
): ApiQueryFactory<T> {
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

    const result = await response.json();
    return mapper ? mapper(result) : result;
  });
}

export const useApiQuery = <T>(apiQueryFactory: ApiQueryFactory<T>) => {
  const { instance: msal, accounts } = useMsal();

  const getAccessToken = async (scopes: string[]) => {
    const token = await msal.acquireTokenSilent({ scopes, account: accounts[0] });
    return token.accessToken;
  };

  return useQuery(
    apiQueryFactory({
      getAccessToken
    })
  );
};
