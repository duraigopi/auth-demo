/* Backend module imports */
import type { PublicUser } from "@backend/types/user";

/* Picks the browser-safe fields explicitly, so a new attribute is never exposed by accident */
export const toPublicUser = (user: PublicUser): PublicUser => ({
  user_id: user.user_id,
  email: user.email,
  name: user.name,
  role: user.role,
  is_active: user.is_active,
});
