import { NextResponse } from "next/server";
import { journalEntries } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(journalEntries);
}
