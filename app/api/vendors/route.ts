import { NextRequest, NextResponse } from "next/server";
import { vendors } from "@/lib/mockData";
import { requireRole } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier", "auditor"]);
  if (!auth.authorized) return auth.response;

  return NextResponse.json(vendors, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  const payload = await req.json();
  return NextResponse.json({ message: "Vendor created", payload }, { status: 201 });
}
