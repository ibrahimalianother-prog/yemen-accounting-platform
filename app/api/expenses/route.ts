import { NextResponse } from "next/server";
import { expenses } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(expenses);
}
