import { NextRequest, NextResponse } from "next/server";
import { invoices } from "@/lib/mockData";
import { requireRole } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier", "sales", "auditor"]);
  if (!auth.authorized) return auth.response;

  return NextResponse.json(invoices, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "sales"]);
  if (!auth.authorized) return auth.response;

  const payload = await req.json();
  return NextResponse.json({ message: "Invoice created", payload }, { status: 201 });
}
