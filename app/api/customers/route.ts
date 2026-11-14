import { NextResponse } from "next/server";
import { customers } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(customers);
}
