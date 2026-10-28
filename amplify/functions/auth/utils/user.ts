/* Backend module imports */
import type { PublicUser } from "@backend/types/auth";

/* Explicit list of returned fields, so new attributes aren't exposed by accident */
export const toPublicUser = (user: PublicUser): PublicUser => ({
  user_id: user.user_id,
  email: user.email,
  name: user.name,
  role: user.role,
  is_active: user.is_active,
});
