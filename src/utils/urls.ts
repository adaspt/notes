export const urlCombine = (...tokens: string[]) =>
  tokens.filter(Boolean).reduce((url, token) => {
    const urlLast = url[url.length - 1];
    const tokenFirst = token[0];

    if (urlLast === '/' && tokenFirst === '/') {
      return url.substring(0, url.length - 1) + token;
    }

    if (urlLast === '/' || tokenFirst === '/') {
      return url + token;
    }

    return `${url}/${token}`;
  });

export type QueryStringValueType = string | number | number[] | boolean | Date | null | undefined;

const queryStringReducer = (acc: string[][], { key, value }: { key: string; value: QueryStringValueType }) => {
  if (value !== undefined && value !== null) {
    if (Array.isArray(value)) {
      acc.push(...value.map((x) => [key, x.toString()]));
    } else if (value instanceof Date) {
      acc.push([key, value.toJSON()]);
    } else {
      acc.push([key, value.toString()]);
    }
  }

  return acc;
};

export const buildQueryString = (params: Record<string, QueryStringValueType>) =>
  new URLSearchParams(
    Object.keys(params).reduce<string[][]>((acc, key) => queryStringReducer(acc, { key, value: params[key] }), [])
  );

export const buildFullUrl = (tokens: string[], searchParams?: Record<string, QueryStringValueType>) => {
  const url = urlCombine(...tokens);
  if (!searchParams) {
    return url;
  }

  const queryString = buildQueryString(searchParams);

  return `${url}?${queryString}`;
};
