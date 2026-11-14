import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  return NextResponse.json({
    users: [
      { id: "u-1", fullName: "مدير النظام", email: "admin@yemenaccounting.com", role: "owner" },
      { id: "u-2", fullName: "المحاسب", email: "accountant@yemenaccounting.com", role: "accountant" },
      { id: "u-3", fullName: "أمين الصندوق", email: "cashier@yemenaccounting.com", role: "cashier" },
    ],
  });
}
