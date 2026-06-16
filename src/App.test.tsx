import { isValidElement } from "react";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vite-plus/test";

import App from "./App";
import { routeTree } from "./routeTree.gen";
import { router } from "./router";

describe("App", () => {
  it("renders a valid React element", () => {
    expect(isValidElement(<App />)).toBe(true);
  });

  it("registers the index route", () => {
    expect(router.routesById["/"]).toBeDefined();
  });

  it("registers main navigation routes", () => {
    expect(router.routesById["/_tasks/today"]).toBeDefined();
    expect(router.routesById["/_tasks/later"]).toBeDefined();
    expect(router.routesById["/_tasks/backlog"]).toBeDefined();
    expect(router.routesById["/notes/inbox"]).toBeDefined();
    expect(router.routesById["/notes/starred"]).toBeDefined();
    expect(router.routesById["/notes/$projectId"]).toBeDefined();
  });

  it("builds concrete project locations", () => {
    const testRouter = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/today"],
      }),
    });

    const location = testRouter.buildLocation({
      to: "/notes/$projectId",
      params: { projectId: "project-1" },
    });

    expect(location.href).toBe("/notes/project-1");
  });
});
