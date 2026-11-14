import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", database: process.env.DATABASE_URL ? "configured" : "pending", auth: process.env.AUTH_SECRET ? "configured" : "pending" });
}
