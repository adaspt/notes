import { z } from "zod";

const graphBaseUrl = "https://graph.microsoft.com/v1.0/";

export class GraphApiError extends Error {
  readonly status: number;
  readonly responseText: string;

  constructor(status: number, responseText: string) {
    super(`Microsoft Graph request failed with status ${status}`);
    this.status = status;
    this.responseText = responseText;
  }
}

export type GraphClientOptions = {
  accessToken: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export class GraphClient {
  private readonly accessToken: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: GraphClientOptions) {
    this.accessToken = options.accessToken;
    this.baseUrl = options.baseUrl ?? graphBaseUrl;
    this.fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  }

  async get<T>(pathOrUrl: string, schema: z.ZodType<T>) {
    return this.request(pathOrUrl, schema);
  }

  async getText(pathOrUrl: string) {
    return this.requestText(pathOrUrl);
  }

  async post<T>(pathOrUrl: string, schema: z.ZodType<T>, body: unknown) {
    return this.request(pathOrUrl, schema, {
      body: JSON.stringify(body),
      method: "POST",
    });
  }

  async patch<T>(pathOrUrl: string, schema: z.ZodType<T>, body: unknown) {
    return this.request(pathOrUrl, schema, {
      body: JSON.stringify(body),
      method: "PATCH",
    });
  }

  async put<T>(pathOrUrl: string, schema: z.ZodType<T>, body: BodyInit, init: RequestInit = {}) {
    return this.request(pathOrUrl, schema, {
      ...init,
      body,
      method: "PUT",
    });
  }

  async delete(pathOrUrl: string) {
    await this.requestNoContent(pathOrUrl, { method: "DELETE" });
  }

  async request<T>(pathOrUrl: string, schema: z.ZodType<T>, init: RequestInit = {}) {
    const response = await this.fetcher(resolveGraphUrl(pathOrUrl, this.baseUrl), {
      ...init,
      headers: createHeaders(this.accessToken, init.headers),
    });

    if (!response.ok) {
      throw new GraphApiError(response.status, await response.text());
    }

    return schema.parse(await response.json());
  }

  async requestText(pathOrUrl: string, init: RequestInit = {}) {
    const response = await this.fetcher(resolveGraphUrl(pathOrUrl, this.baseUrl), {
      ...init,
      headers: createHeaders(this.accessToken, init.headers),
    });

    if (!response.ok) {
      throw new GraphApiError(response.status, await response.text());
    }

    return response.text();
  }

  async requestNoContent(pathOrUrl: string, init: RequestInit = {}) {
    const response = await this.fetcher(resolveGraphUrl(pathOrUrl, this.baseUrl), {
      ...init,
      headers: createHeaders(this.accessToken, init.headers),
    });

    if (!response.ok) {
      throw new GraphApiError(response.status, await response.text());
    }
  }
}

export function createGraphClient(accessToken: string) {
  return new GraphClient({ accessToken });
}

export type GraphCollectionResponse<T> = {
  value: T[];
  "@odata.nextLink"?: string;
  "@odata.deltaLink"?: string;
};

export async function readPagedGraphCollection<T>(
  client: Pick<GraphClient, "get">,
  pathOrUrl: string,
  itemSchema: z.ZodType<T>,
) {
  const items: T[] = [];
  let nextUrl: string | undefined = pathOrUrl;
  const pageSchema = graphCollectionResponseSchema(itemSchema);

  while (nextUrl) {
    const page: GraphCollectionResponse<T> = await client.get(nextUrl, pageSchema);
    items.push(...page.value);
    nextUrl = page["@odata.nextLink"];
  }

  return items;
}

export type PagedGraphCollectionResult<T> = {
  items: T[];
  deltaLink: string | null;
};

export async function readPagedGraphCollectionWithDelta<T>(
  client: Pick<GraphClient, "get">,
  pathOrUrl: string,
  itemSchema: z.ZodType<T>,
): Promise<PagedGraphCollectionResult<T>> {
  const items: T[] = [];
  let deltaLink: string | null = null;
  let nextUrl: string | undefined = pathOrUrl;
  const pageSchema = graphCollectionResponseSchema(itemSchema);

  while (nextUrl) {
    const page: GraphCollectionResponse<T> = await client.get(nextUrl, pageSchema);
    items.push(...page.value);
    deltaLink = page["@odata.deltaLink"] ?? deltaLink;
    nextUrl = page["@odata.nextLink"];
  }

  return { items, deltaLink };
}

export function graphCollectionResponseSchema<T>(
  itemSchema: z.ZodType<T>,
): z.ZodType<GraphCollectionResponse<T>> {
  return z.object({
    value: z.array(itemSchema),
    "@odata.nextLink": z.string().url().optional(),
    "@odata.deltaLink": z.string().url().optional(),
  });
}

function resolveGraphUrl(pathOrUrl: string, baseUrl: string) {
  return new URL(pathOrUrl.replace(/^\//, ""), baseUrl).toString();
}

function createHeaders(accessToken: string, headers: HeadersInit | undefined) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  requestHeaders.set("Accept", "application/json");

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return requestHeaders;
}
