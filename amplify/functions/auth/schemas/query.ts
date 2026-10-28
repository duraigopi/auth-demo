/* Library imports */
import { z } from "zod/v4";

export const listQuerySchema = z.object({
  page: z.coerce
    .number({ message: "Please provide a valid page number" })
    .int({ message: "Please provide a valid page number" })
    .min(1, { message: "Please provide a valid page number" })
    .max(10000, { message: "Please provide a valid page number" })
    .default(1),
  limit: z.coerce
    .number({ message: "Please provide a valid limit" })
    .int({ message: "Please provide a valid limit" })
    .min(1, { message: "Please provide a valid limit" })
    .max(100, { message: "Please provide a limit less than or equal to 100" })
    .default(20),
  search: z.string().trim().max(100, "Please enter up to 100 characters").optional(),
});
