/* Library imports */
import bcrypt from "bcryptjs";

/* Backend module imports */
import { AUTH_CONFIG } from "@backend/constants/auth";

export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);

export const verifyPassword = (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);
