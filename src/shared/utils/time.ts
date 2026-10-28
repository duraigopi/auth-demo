/* Library imports */
import { format, parseISO } from "date-fns";

/* Formats an ISO timestamp as dd-Mon-yyyy (e.g. "16-Jan-2026"); returns the fallback when it is empty or invalid */
export const formatDisplayDate = (isoString: string | undefined | null, fallback = "-") => {
  if (!isoString) return fallback;
  const date = parseISO(isoString);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, "dd-MMM-yyyy");
};

/* Same as formatDisplayDate, plus the time as HH:mm (e.g. "16-Jan-2026, 10:30") */
export const formatDisplayDateTime = (isoString: string | undefined | null, fallback = "-") => {
  if (!isoString) return fallback;
  const date = parseISO(isoString);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, "dd-MMM-yyyy, HH:mm");
};
