/* Library imports */
import bcrypt from "bcryptjs";

/* Backend module imports */
import { AUTH_CONFIG } from "@backend/constants/auth";

/* Hashes a password with bcrypt */
export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);

/* Checks a password against a stored bcrypt hash */
export const verifyPassword = (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);
