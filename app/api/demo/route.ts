import { NextResponse } from "next/server";
import { customers, expenses, invoices, journalEntries, vendors } from "@/lib/mockData";

// Public demo endpoint: static sample data only. Add authentication and company scoping before production.
export async function GET() {
  return NextResponse.json({
    warning: "Demo fixture data only; no persistent accounting records.",
    invoices,
    expenses,
    journalEntries,
    customers,
    vendors,
  }, { headers: { "Cache-Control": "no-store" } });
}
