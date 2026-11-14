import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/invoices",
  "/expenses",
  "/journal",
  "/customers",
  "/vendors",
  "/reports",
  "/admin",
  "/accounts",
  "/settings",
];

// Middleware runs on the Edge runtime, where `jsonwebtoken` (Node crypto) is
// unavailable, so the HS256 token is verified here with the Web Crypto API.
function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") return null;
  return "development_secret_change_me";
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function isValidToken(token: string) {
  const secret = getSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;

  try {
    const parsedHeader = JSON.parse(new TextDecoder().decode(base64UrlToBytes(header)));
    if (parsedHeader.alg !== "HS256") return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(`${header}.${payload}`),
    );
    if (!valid) return false;

    const claims = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    if (typeof claims.exp === "number" && claims.exp * 1000 <= Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  const shouldProtect = protectedRoutes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!shouldProtect) return NextResponse.next();
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  if (await isValidToken(token)) return NextResponse.next();

  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.delete("auth_token");
  return response;
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
    "/accounts/:path*",
    "/settings/:path*",
  ],
};
