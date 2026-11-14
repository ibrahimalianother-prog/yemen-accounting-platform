import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAuthSecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    return jwt.verify(token, getAuthSecret(), { algorithms: ["HS256"] }) as AuthUser;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    } as const;
  }

  return { authorized: true, user } as const;
}

/**
 * Verifies the session and checks the role against the database, not the token, so a role change
 * or a deactivated account takes effect immediately instead of when the token expires.
 */
export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const auth = requireAuth(req);
  if (!auth.authorized) return auth;

  const current = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: { role: true, isActive: true },
  });

  if (!current || !current.isActive) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    } as const;
  }

  if (!allowedRoles.includes(current.role)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as const;
  }

  return { authorized: true, user: { ...auth.user, role: current.role } } as const;
}
