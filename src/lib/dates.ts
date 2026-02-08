import type { DateTimeTimeZone, NullableOption } from '@microsoft/microsoft-graph-types';

export const formatDateLocal = (value: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const pad = (part: number) => String(part).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};

export const dateTimeTimeZoneToLocalDate = (value: NullableOption<DateTimeTimeZone> | undefined): string | null => {
  if (!value || !value.dateTime) {
    return null;
  }

  return formatDateLocal(`${value.dateTime}Z`);
};

export const localDateToDateTimeTimeZone = (value: string | null): DateTimeTimeZone | null => {
  const localDate = formatDateLocal(value);
  if (!localDate) {
    return null;
  }

  return { dateTime: localDate, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
};
