import { NextResponse } from "next/server";
import { vendors } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(vendors);
}
