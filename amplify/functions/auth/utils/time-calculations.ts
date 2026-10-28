/* Time utilities, so callers never read the clock directly */

/* Library imports */
import { addDays, addMinutes, getUnixTime, isPast, parseISO } from "date-fns";

/* Get current date as ISO string */
export const getISOString = (): string => new Date().toISOString();

/* Get current time as Unix seconds, the unit DynamoDB TTL expects */
export const getUnixTimestamp = (): number => getUnixTime(new Date());

/* ISO string for a point in time some minutes from now */
export const addMinutesToISOString = (minutes: number): string => addMinutes(new Date(), minutes).toISOString();

/* Unix seconds for a point in time some days from now */
export const addDaysToUnixTimestamp = (days: number): number => getUnixTime(addDays(new Date(), days));

/* True once an ISO timestamp is in the past */
export const isISOExpired = (iso: string): boolean => isPast(parseISO(iso));

/* Unix seconds for a point in time some minutes from now, the unit JWT exp expects */
export const addMinutesToUnixTimestamp = (minutes: number): number => getUnixTime(addMinutes(new Date(), minutes));
