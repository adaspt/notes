import { describe, expect, it } from "vite-plus/test";
import { z } from "zod";

import {
  GraphApiError,
  GraphClient,
  readPagedGraphCollection,
  readPagedGraphCollectionWithDelta,
} from "./graph-client";

describe("GraphClient", () => {
  it("sends bearer tokens and validates JSON responses", async () => {
    const fetcher: typeof fetch = async (url, init) => {
      expect(getRequestUrl(url)).toBe("https://graph.test/me");
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer token-1");

      return Response.json({ id: "user-1" });
    };
    const client = new GraphClient({
      accessToken: "token-1",
      baseUrl: "https://graph.test/",
      fetcher,
    });

    await expect(client.get("/me", z.object({ id: z.string() }))).resolves.toEqual({
      id: "user-1",
    });
  });

  it("throws GraphApiError for failed responses", async () => {
    const client = new GraphClient({
      accessToken: "token-1",
      fetcher: async () =>
        new Response("bad request", {
          status: 400,
        }),
    });

    await expect(client.get("/me", z.object({ id: z.string() }))).rejects.toBeInstanceOf(
      GraphApiError,
    );
  });

  it("follows paged collection next links", async () => {
    const urls: string[] = [];
    const fetcher: typeof fetch = async (url) => {
      const requestUrl = getRequestUrl(url);
      urls.push(requestUrl);

      if (requestUrl.endsWith("/first")) {
        return Response.json({
          value: [{ id: "one" }],
          "@odata.nextLink": "https://graph.test/second",
        });
      }

      return Response.json({
        value: [{ id: "two" }],
      });
    };
    const client = new GraphClient({
      accessToken: "token-1",
      baseUrl: "https://graph.test/",
      fetcher,
    });

    await expect(
      readPagedGraphCollection(client, "/first", z.object({ id: z.string() })),
    ).resolves.toEqual([{ id: "one" }, { id: "two" }]);
    expect(urls).toEqual(["https://graph.test/first", "https://graph.test/second"]);
  });

  it("returns the final delta link for paged delta collections", async () => {
    const client = new GraphClient({
      accessToken: "token-1",
      baseUrl: "https://graph.test/",
      fetcher: async (url) => {
        const requestUrl = getRequestUrl(url);

        if (requestUrl.endsWith("/first")) {
          return Response.json({
            value: [{ id: "one" }],
            "@odata.nextLink": "https://graph.test/second",
          });
        }

        return Response.json({
          value: [{ id: "two" }],
          "@odata.deltaLink": "https://graph.test/delta?token=1",
        });
      },
    });

    await expect(
      readPagedGraphCollectionWithDelta(client, "/first", z.object({ id: z.string() })),
    ).resolves.toEqual({
      items: [{ id: "one" }, { id: "two" }],
      deltaLink: "https://graph.test/delta?token=1",
    });
  });
});

function getRequestUrl(url: Parameters<typeof fetch>[0]) {
  if (url instanceof Request) {
    return url.url;
  }

  if (url instanceof URL) {
    return url.toString();
  }

  return url;
}
