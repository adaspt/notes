import type { DayOfWeek } from "@/data/schemas";

const dayNames: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function addDays(date: Date, days: number) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateInputValue(value: string) {
  const [year = "", month = "", day = ""] = value.split("-");
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function toDateTimeInputValue(date: Date | null) {
  if (!date) return "";
  return `${toDateInputValue(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeInputValue(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function graphDateString(date: Date) {
  return toDateInputValue(date);
}

export function getDayName(date: Date): DayOfWeek {
  return dayNames[date.getDay()] ?? "monday";
}

const pad = (value: number) => value.toString().padStart(2, "0");
