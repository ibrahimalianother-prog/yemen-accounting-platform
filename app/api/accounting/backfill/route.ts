import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { backfillAccounting } from "@/lib/accounting";
import { logAudit } from "@/lib/audit";
import { getActiveCompanyId } from "@/lib/company";
import { requireRole } from "@/lib/server-auth";

/** Creates the missing automatic journal entries for documents that predate automatic posting. */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  try {
    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const result = await backfillAccounting(prisma, companyId);

    await logAudit({
      userId: auth.user.userId,
      action: "accounting.backfill",
      entityType: "Company",
      entityId: companyId,
      metadata: { entries: result.entries, alreadyPosted: result.alreadyPosted, failed: result.failed },
    });

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to create journal entries." }, { status: 500 });
  }
}
