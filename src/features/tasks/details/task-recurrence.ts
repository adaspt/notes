import type { Recurrence } from "@/data/schemas";
import { getDayName, graphDateString, startOfDay } from "./task-date-utils";

export type RecurrencePreset = "none" | "daily" | "weekdays" | "weekly" | "monthly" | "yearly";

export const recurrencePresets: Array<{ value: RecurrencePreset; label: string }> = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function getRecurrencePreset(recurrence: Recurrence | null): RecurrencePreset {
  if (!recurrence) return "none";
  const { pattern } = recurrence;

  if (pattern.type === "daily") return "daily";
  if (pattern.type === "weekly" && isWeekdays(pattern.daysOfWeek)) return "weekdays";
  if (pattern.type === "weekly") return "weekly";
  if (pattern.type === "absoluteMonthly") return "monthly";
  if (pattern.type === "absoluteYearly") return "yearly";

  return "none";
}

export function buildRecurrence(preset: RecurrencePreset, anchor: Date): Recurrence | null {
  if (preset === "none") return null;

  const start = startOfDay(anchor);
  const range = {
    type: "noEnd" as const,
    startDate: graphDateString(start),
    recurrenceTimeZone: "UTC",
  };

  if (preset === "daily") {
    return { pattern: { type: "daily", interval: 1 }, range };
  }

  if (preset === "weekdays") {
    return {
      pattern: {
        type: "weekly",
        interval: 1,
        daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        firstDayOfWeek: "monday",
      },
      range,
    };
  }

  if (preset === "weekly") {
    return {
      pattern: {
        type: "weekly",
        interval: 1,
        daysOfWeek: [getDayName(start)],
        firstDayOfWeek: "monday",
      },
      range,
    };
  }

  if (preset === "monthly") {
    return {
      pattern: { type: "absoluteMonthly", interval: 1, dayOfMonth: start.getDate() },
      range,
    };
  }

  return {
    pattern: {
      type: "absoluteYearly",
      interval: 1,
      dayOfMonth: start.getDate(),
      month: start.getMonth() + 1,
    },
    range,
  };
}

const isWeekdays = (days: string[] | undefined) =>
  days?.length === 5 &&
  ["monday", "tuesday", "wednesday", "thursday", "friday"].every((day) => days.includes(day));
