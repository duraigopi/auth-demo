/* Library imports */
import { format, isValid, parseISO } from "date-fns";

/* Format an ISO date with the given pattern, or the fallback when it is empty or invalid */
const formatIso = (isoString: string | undefined | null, pattern: string, fallback: string) => {
  if (!isoString) return fallback;
  const date = parseISO(isoString);
  return isValid(date) ? format(date, pattern) : fallback;
};

/* Format an ISO date as dd-MMM-yyyy */
export const formatDisplayDate = (isoString: string | undefined | null, fallback = "-") =>
  formatIso(isoString, "dd-MMM-yyyy", fallback);

/* Same as above with the time */
export const formatDisplayDateTime = (isoString: string | undefined | null, fallback = "-") =>
  formatIso(isoString, "dd-MMM-yyyy, HH:mm", fallback);
