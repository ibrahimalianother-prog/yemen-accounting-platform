import { NextRequest, NextResponse } from "next/server";
import { expenses } from "@/lib/mockData";
import { requireRole } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier", "auditor"]);
  if (!auth.authorized) return auth.response;

  return NextResponse.json(expenses, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier"]);
  if (!auth.authorized) return auth.response;

  const payload = await req.json();
  return NextResponse.json({ message: "Expense created successfully", payload }, { status: 201 });
}
