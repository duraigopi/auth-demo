/* Library imports */
import { addDays, addMinutes, getUnixTime, isPast, parseISO } from "date-fns";

/* Current time as an ISO string */
export const getISOString = (): string => new Date().toISOString();

/* Current time in Unix seconds */
export const getUnixTimestamp = (): number => getUnixTime(new Date());

/* ISO string some minutes from now */
export const addMinutesToISOString = (minutes: number): string => addMinutes(new Date(), minutes).toISOString();

/* Unix seconds some days from now, used for TTL */
export const addDaysToUnixTimestamp = (days: number): number => getUnixTime(addDays(new Date(), days));

/* True when an ISO time is already in the past */
export const isISOExpired = (iso: string): boolean => isPast(parseISO(iso));

/* Unix seconds some minutes from now, used for the JWT exp */
export const addMinutesToUnixTimestamp = (minutes: number): number => getUnixTime(addMinutes(new Date(), minutes));

/* True when an ISO time is inside the UTC day range, both days included */
export const isInDayRange = (iso: string, from?: string, to?: string): boolean => {
  const time = parseISO(iso).getTime();
  if (from && time < parseISO(`${from}T00:00:00.000Z`).getTime()) return false;
  if (to && time > parseISO(`${to}T23:59:59.999Z`).getTime()) return false;
  return true;
};
