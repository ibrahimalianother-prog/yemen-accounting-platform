import { NextRequest, NextResponse } from "next/server";
import { customers } from "@/lib/mockData";
import { requireRole } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "sales", "auditor"]);
  if (!auth.authorized) return auth.response;

  return NextResponse.json(customers, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "sales"]);
  if (!auth.authorized) return auth.response;

  const payload = await req.json();
  return NextResponse.json({ message: "Customer created successfully", payload }, { status: 201 });
}
