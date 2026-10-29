/* Library imports */
import type { FieldErrors, FieldValues } from "react-hook-form";

/* Collect field messages, the raw errors hold DOM refs */
export const getErrorMessages = <T extends FieldValues>(errors: FieldErrors<T>): string[] =>
  (Object.entries(errors) as [string, { message?: string } | undefined][]).map(
    ([name, error]) => `${name}: ${error?.message ?? "Invalid value"}`,
  );
