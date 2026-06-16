import { describe, expect, it } from "vite-plus/test";

import type { LocalTaskRecord } from "@/lib/local-data";

import {
  formatTaskDueDate,
  getBacklogTaskListItems,
  getLaterTaskListItems,
  getTodayTaskListItems,
  isBacklogTask,
  isLaterTask,
  isTodayTask,
} from "./task-list-format";

const now = "2026-06-15T12:00:00.000Z";

function createTaskRecord(overrides: Partial<LocalTaskRecord>): LocalTaskRecord {
  return {
    id: "task",
    remoteId: "task",
    title: "Task",
    body: "",
    dueDate: null,
    priority: "normal",
    status: "notStarted",
    remoteUpdatedAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("Today task list formatting", () => {
  it("includes open tasks due today, overdue, or without a due date", () => {
    expect(isTodayTask(createTaskRecord({ dueDate: "2026-06-15" }), "2026-06-15")).toBe(true);
    expect(isTodayTask(createTaskRecord({ dueDate: "2026-06-14" }), "2026-06-15")).toBe(true);
    expect(isTodayTask(createTaskRecord({ dueDate: null }), "2026-06-15")).toBe(true);
  });

  it("excludes future, completed, and deferred tasks", () => {
    expect(isTodayTask(createTaskRecord({ dueDate: "2026-06-16" }), "2026-06-15")).toBe(false);
    expect(isTodayTask(createTaskRecord({ status: "completed" }), "2026-06-15")).toBe(false);
    expect(isTodayTask(createTaskRecord({ status: "deferred" }), "2026-06-15")).toBe(false);
  });

  it("sorts by priority, due date, no due date, and stable identity", () => {
    const items = getTodayTaskListItems(
      [
        createTaskRecord({
          id: "normal-no-date",
          title: "Zeta no date",
          priority: "normal",
          dueDate: null,
        }),
        createTaskRecord({
          id: "high-today",
          title: "High today",
          priority: "high",
          dueDate: "2026-06-15",
        }),
        createTaskRecord({
          id: "high-overdue",
          title: "High overdue",
          priority: "high",
          dueDate: "2026-06-14",
        }),
        createTaskRecord({
          id: "normal-no-date-earlier",
          title: "Alpha no date",
          priority: "normal",
          dueDate: null,
        }),
      ],
      "2026-06-15",
    );

    expect(items.map((item) => item.id)).toEqual([
      "high-overdue",
      "high-today",
      "normal-no-date-earlier",
      "normal-no-date",
    ]);
  });

  it("formats Today due date metadata", () => {
    expect(formatTaskDueDate(null, "2026-06-15")).toBe("No due date");
    expect(formatTaskDueDate("2026-06-15", "2026-06-15")).toBe("Due today");
    expect(formatTaskDueDate("2026-06-12", "2026-06-15")).toBe("Overdue 06/12");
    expect(formatTaskDueDate("2026-06-20", "2026-06-15")).toBe("Due 06/20");
  });
});

describe("Later task list formatting", () => {
  it("includes open tasks with future due dates", () => {
    expect(isLaterTask(createTaskRecord({ dueDate: "2026-06-16" }), "2026-06-15")).toBe(true);
  });

  it("excludes due today, no-date, completed, and deferred tasks", () => {
    expect(isLaterTask(createTaskRecord({ dueDate: "2026-06-15" }), "2026-06-15")).toBe(false);
    expect(isLaterTask(createTaskRecord({ dueDate: null }), "2026-06-15")).toBe(false);
    expect(
      isLaterTask(createTaskRecord({ dueDate: "2026-06-16", status: "completed" }), "2026-06-15"),
    ).toBe(false);
    expect(
      isLaterTask(createTaskRecord({ dueDate: "2026-06-16", status: "deferred" }), "2026-06-15"),
    ).toBe(false);
  });

  it("sorts by due date, priority, and stable identity", () => {
    const items = getLaterTaskListItems(
      [
        createTaskRecord({
          id: "normal-later",
          title: "Normal later",
          priority: "normal",
          dueDate: "2026-06-20",
        }),
        createTaskRecord({
          id: "low-sooner",
          title: "Low sooner",
          priority: "low",
          dueDate: "2026-06-16",
        }),
        createTaskRecord({
          id: "high-later",
          title: "High later",
          priority: "high",
          dueDate: "2026-06-20",
        }),
      ],
      "2026-06-15",
    );

    expect(items.map((item) => item.id)).toEqual(["low-sooner", "high-later", "normal-later"]);
  });
});

describe("Backlog task list formatting", () => {
  it("includes deferred tasks only", () => {
    expect(isBacklogTask(createTaskRecord({ status: "deferred" }))).toBe(true);
    expect(isBacklogTask(createTaskRecord({ status: "notStarted" }))).toBe(false);
    expect(isBacklogTask(createTaskRecord({ status: "completed" }))).toBe(false);
  });

  it("sorts by priority, due date, no due date, and stable identity", () => {
    const items = getBacklogTaskListItems(
      [
        createTaskRecord({
          id: "normal-no-date",
          title: "Normal no date",
          priority: "normal",
          status: "deferred",
          dueDate: null,
        }),
        createTaskRecord({
          id: "high-no-date",
          title: "High no date",
          priority: "high",
          status: "deferred",
          dueDate: null,
        }),
        createTaskRecord({
          id: "normal-dated",
          title: "Normal dated",
          priority: "normal",
          status: "deferred",
          dueDate: "2026-06-20",
        }),
      ],
      "2026-06-15",
    );

    expect(items.map((item) => item.id)).toEqual([
      "high-no-date",
      "normal-dated",
      "normal-no-date",
    ]);
  });
});
