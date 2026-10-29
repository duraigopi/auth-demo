/* Library imports */
import { format, parseISO } from "date-fns";

/* Format an ISO date as dd-MMM-yyyy */
export const formatDisplayDate = (isoString: string | undefined | null, fallback = "-") => {
  if (!isoString) return fallback;
  const date = parseISO(isoString);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, "dd-MMM-yyyy");
};

/* Same as above with the time */
export const formatDisplayDateTime = (isoString: string | undefined | null, fallback = "-") => {
  if (!isoString) return fallback;
  const date = parseISO(isoString);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, "dd-MMM-yyyy, HH:mm");
};
