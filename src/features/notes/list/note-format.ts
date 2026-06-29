export const noteSnippet = (body: string) =>
  body
    .split("\n")
    .map((line) => line.replaceAll(/[#>*_`[\]-]/g, "").trim())
    .find(Boolean) ?? "No content";

export function formatRelativeTime(date: Date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 60) return "just now";

  const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["minute", 60],
    ["hour", 60],
    ["day", 24],
    ["week", 7],
    ["month", 4.345],
    ["year", 12],
  ];

  let value = seconds;
  let unit: Intl.RelativeTimeFormatUnit = "second";

  for (const [nextUnit, amount] of divisions) {
    if (Math.abs(value) < amount) break;
    value /= amount;
    unit = nextUnit;
  }

  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    Math.round(value),
    unit,
  );
}
