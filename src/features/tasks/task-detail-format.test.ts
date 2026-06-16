import { describe, expect, it } from "vite-plus/test";

import type { LocalTaskRecord } from "@/lib/local-data";

import { formatTaskStatus, toTaskDetailViewModel } from "./task-detail-format";

const now = "2026-06-15T12:00:00.000Z";

function createTaskRecord(overrides: Partial<LocalTaskRecord> = {}): LocalTaskRecord {
  return {
    id: "task-1",
    remoteId: "task-1",
    title: "Review task details",
    body: "Show synced Microsoft To Do notes.",
    dueDate: "2026-06-15",
    priority: "high",
    status: "notStarted",
    remoteUpdatedAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("task detail formatting", () => {
  it("formats the detail header, notes body, and fields", () => {
    expect(toTaskDetailViewModel(createTaskRecord(), "2026-06-15")).toEqual({
      title: "Review task details",
      dueDateLabel: "Due today",
      notesBody: "Show synced Microsoft To Do notes.",
      priorityLabel: "High priority",
      statusLabel: "Not started",
    });
  });

  it("hides empty notes bodies", () => {
    expect(toTaskDetailViewModel(createTaskRecord({ body: "   " })).notesBody).toBeNull();
  });

  it("formats every local task status", () => {
    expect(formatTaskStatus("notStarted")).toBe("Not started");
    expect(formatTaskStatus("completed")).toBe("Completed");
    expect(formatTaskStatus("deferred")).toBe("Deferred");
  });
});
