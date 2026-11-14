import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

export const AUTH_COOKIE = "auth_token";

export function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "development_secret_change_me";
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, getAuthSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getAuthSecret()) as TokenPayload;
}

export function getCurrentUserFromCookies() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifyToken(token) as TokenPayload;
  } catch {
    return null;
  }
}
