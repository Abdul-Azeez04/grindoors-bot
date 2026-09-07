import { DateTime } from 'luxon';

export function formatInTimezone(date: Date, timezone: string, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
  return DateTime.fromJSDate(date).setZone(timezone).toFormat(format);
}

export function getNextOccurrence(hour: number, minute: number, timezone: string): Date {
  const now = DateTime.now().setZone(timezone);
  let next = now.set({ hour, minute, second: 0, millisecond: 0 });
  if (next < now) {
    next = next.plus({ days: 1 });
  }
  return next.toJSDate();
}

export function getTimezoneOffset(timezone: string): string {
  const dt = DateTime.now().setZone(timezone);
  return dt.offsetNameShort || dt.toFormat('ZZZZ');
}

export function isValidTimezone(tz: string): boolean {
  return DateTime.now().setZone(tz).isValid;
}
