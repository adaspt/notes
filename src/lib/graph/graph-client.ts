import type z from "zod";

const MAX_RETRIES = 3;
const graphBaseUrl = "https://graph.microsoft.com/v1.0/";

export class GraphApiError extends Error {
  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.status = status;
    this.code = code;
  }

  readonly status: number;
  readonly code: string | null;
}

/**
 * The request never reached Graph (offline, DNS/TLS failure, connection dropped).
 * `fetch()` signals this by rejecting with a `TypeError`; we wrap it here so callers can
 * recognize a retryable network failure without treating every `TypeError` as transient.
 */
export class GraphNetworkError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GraphNetworkError";
  }
}

export interface GraphTokenProvider {
  getToken(): Promise<string>;
}

export class GraphClient {
  constructor(tokenProvider: GraphTokenProvider) {
    this.#tokenProvider = tokenProvider;
  }

  #tokenProvider: GraphTokenProvider;

  async get(pathOrUrl: string): Promise<void>;
  async get<T>(pathOrUrl: string, schema: z.ZodType<T>): Promise<T>;
  async get<T>(pathOrUrl: string, schema?: z.ZodType<T>) {
    const response = await this.#request(pathOrUrl);
    if (!schema) {
      return;
    }

    return schema.parse(await response.json());
  }

  async post<T>(pathOrUrl: string, schema: z.ZodType<T>, body: unknown) {
    const response = await this.#request(pathOrUrl, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return schema.parse(await response.json());
  }

  async patch<T>(pathOrUrl: string, schema: z.ZodType<T>, body: unknown) {
    const response = await this.#request(pathOrUrl, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return schema.parse(await response.json());
  }

  async put<T>(pathOrUrl: string, schema: z.ZodType<T>, body: unknown) {
    const response = await this.#request(pathOrUrl, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return schema.parse(await response.json());
  }

  async getText(pathOrUrl: string): Promise<string> {
    const response = await this.#request(pathOrUrl, {
      headers: { Accept: "text/plain" },
    });

    return await response.text();
  }

  async putText<T>(pathOrUrl: string, schema: z.ZodType<T>, body: string) {
    const response = await this.#request(pathOrUrl, {
      method: "PUT",
      body,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });

    return schema.parse(await response.json());
  }

  async delete(pathOrUrl: string) {
    await this.#request(pathOrUrl, { method: "DELETE" });
  }

  async #request(pathOrUrl: string, init: RequestInit = {}): Promise<Response> {
    const url = resolveGraphUrl(pathOrUrl, graphBaseUrl);

    let retriesLeft = MAX_RETRIES;
    let response: Response;
    for (;;) {
      const accessToken = await this.#tokenProvider.getToken();
      try {
        response = await fetch(url, {
          ...init,
          headers: createHeaders(accessToken, init),
        });
      } catch (error) {
        // fetch() rejects with a TypeError only when the request can't be made at all.
        if (error instanceof TypeError) {
          throw new GraphNetworkError("Network request to Graph failed", { cause: error });
        }
        throw error;
      }

      if (response.status === 429 && retriesLeft > 0) {
        retriesLeft--;
        await sleep(normalizeRetryAfter(response.headers.get("Retry-After")));
        continue;
      }

      break;
    }

    if (!response.ok) {
      throw await parseGraphError(response);
    }

    return response;
  }
}

function resolveGraphUrl(pathOrUrl: string, baseUrl: string) {
  return new URL(pathOrUrl.replace(/^\//, ""), baseUrl).toString();
}

function createHeaders(accessToken: string, init: RequestInit) {
  const requestHeaders = new Headers(init.headers);
  requestHeaders.set("Authorization", `Bearer ${accessToken}`);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (init.body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return requestHeaders;
}

function normalizeRetryAfter(value: string | null) {
  if (!value) {
    return 1000;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const date = Date.parse(value);
  if (Number.isFinite(date)) {
    return Math.max(0, date - Date.now());
  }

  return 1000;
}

async function parseGraphError(response: Response) {
  let code: string | null = null;
  let message = `Graph request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as {
      error?: { code?: string; message?: string };
    };

    code = body.error?.code ?? null;
    message = body.error?.message ?? message;
  } catch {
    // Keep the status-only message when Graph returns an empty or non-JSON body.
  }

  return new GraphApiError(message, response.status, code);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
