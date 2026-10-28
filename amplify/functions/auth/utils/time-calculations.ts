/* Library imports */
import { addDays, addMinutes, getUnixTime, isPast, parseISO } from "date-fns";

/* Current time as an ISO string */
export const getISOString = (): string => new Date().toISOString();

/* Current time in Unix seconds */
export const getUnixTimestamp = (): number => getUnixTime(new Date());

/* ISO string for a time some minutes from now */
export const addMinutesToISOString = (minutes: number): string => addMinutes(new Date(), minutes).toISOString();

/* Unix seconds for a time some days from now, used for TTL values */
export const addDaysToUnixTimestamp = (days: number): number => getUnixTime(addDays(new Date(), days));

/* True when an ISO time is already in the past */
export const isISOExpired = (iso: string): boolean => isPast(parseISO(iso));

/* Unix seconds for a time some minutes from now, used for the JWT exp claim */
export const addMinutesToUnixTimestamp = (minutes: number): number => getUnixTime(addMinutes(new Date(), minutes));
