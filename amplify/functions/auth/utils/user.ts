/* Backend module imports */
import type { PublicUser } from "@backend/types/auth";

/* Only return these fields so new attributes don't leak */
export const toPublicUser = (user: PublicUser): PublicUser => ({
  user_id: user.user_id,
  email: user.email,
  name: user.name,
  role: user.role,
  is_active: user.is_active,
  created_at: user.created_at,
});
