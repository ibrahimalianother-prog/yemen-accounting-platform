import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAuthSecret } from "@/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/invoices",
  "/expenses",
  "/journal",
  "/customers",
  "/vendors",
  "/reports",
  "/admin",
  "/settings",
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  const shouldProtect = protectedRoutes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!shouldProtect) return NextResponse.next();
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    jwt.verify(token, getAuthSecret());
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/invoices/:path*",
    "/expenses/:path*",
    "/journal/:path*",
    "/customers/:path*",
    "/vendors/:path*",
    "/reports/:path*",
    "/admin/:path*",
    "/settings/:path*",
  ],
};
