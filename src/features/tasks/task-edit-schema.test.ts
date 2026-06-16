import { describe, expect, it } from "vite-plus/test";

import type { LocalTaskRecord } from "@/lib/local-data";

import { taskEditFormSchema, toTaskEditFormValues, toTaskEditValues } from "./task-edit-schema";

const task: LocalTaskRecord = {
  id: "task-1",
  remoteId: "task-1",
  title: "Original",
  body: "Body",
  dueDate: null,
  priority: "normal",
  status: "notStarted",
  remoteUpdatedAt: "2026-06-15T12:00:00.000Z",
  updatedAt: "2026-06-15T12:00:00.000Z",
};

describe("task edit schema", () => {
  it("maps local tasks to form values", () => {
    expect(toTaskEditFormValues(task)).toEqual({
      title: "Original",
      body: "Body",
      dueDate: "",
      priority: "normal",
      status: "notStarted",
    });
  });

  it("maps form values back to local edit values", () => {
    expect(
      toTaskEditValues({
        title: "  Updated  ",
        body: "Updated body",
        dueDate: "",
        priority: "high",
        status: "deferred",
      }),
    ).toEqual({
      title: "Updated",
      body: "Updated body",
      dueDate: null,
      priority: "high",
      status: "deferred",
    });
  });

  it("rejects empty titles", () => {
    expect(() =>
      taskEditFormSchema.parse({
        title: " ",
        body: "",
        dueDate: "",
        priority: "normal",
        status: "notStarted",
      }),
    ).toThrow();
  });
});
