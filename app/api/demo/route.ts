import { NextResponse } from "next/server";
import { customers, expenses, invoices, journalEntries, vendors } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({
    message: "Demo data fixture",
    invoices,
    expenses,
    journalEntries,
    customers,
    vendors,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
