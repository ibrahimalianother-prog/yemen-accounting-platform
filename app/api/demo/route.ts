import { NextRequest, NextResponse } from "next/server";
import { customers, expenses, invoices, journalEntries, vendors } from "@/lib/mockData";
import { requireRole } from "@/lib/server-auth";

const data = {
  invoices,
  expenses,
  journalEntries,
  customers,
  vendors,
};

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier", "sales", "auditor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
