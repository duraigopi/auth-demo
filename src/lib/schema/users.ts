/* Library imports */
import { z } from "zod/v4";

export const editUserSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter the full name")
    .max(100, "Please enter a name less than 100 characters"),
  role: z.enum(["ADMIN", "CLIENT"], { error: "Please select the role" }),
});
