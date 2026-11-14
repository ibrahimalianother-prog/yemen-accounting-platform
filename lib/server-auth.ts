import { NextRequest, NextResponse } from "next/server";

export type AuthUser = {
  userId: string;
  email: string;
  role: string;
};

export function getTokenFromRequest(req: NextRequest) {
  return req.cookies.get("auth_token")?.value ?? null;
}

export function getAuthenticatedUser(req: NextRequest): AuthUser | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  try {
    const jwt = require("jsonwebtoken");
    return jwt.verify(token, process.env.AUTH_SECRET ?? "development_secret_change_me") as AuthUser;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.redirect(new URL("/login", req.url)),
    } as const;
  }

  return { authorized: true, user } as const;
}

export function requireRole(req: NextRequest, allowedRoles: string[]) {
  const auth = requireAuth(req);
  if (!auth.authorized) return auth;

  if (!allowedRoles.includes(auth.user.role)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as const;
  }

  return { authorized: true, user: auth.user } as const;
}
