/* Time utilities, so callers never read the clock directly */

/* Get current date as ISO string */
export const getISOString = (): string => new Date().toISOString();
