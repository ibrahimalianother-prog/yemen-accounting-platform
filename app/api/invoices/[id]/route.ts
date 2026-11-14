import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { postInvoiceAccounting, reverseSourceEntries } from "@/lib/accounting";
import { logAudit } from "@/lib/audit";
import { getActiveCompanyId } from "@/lib/company";
import { requireRole } from "@/lib/server-auth";

const statusSchema = z.object({ status: z.enum(["pending", "paid", "cancelled"]) });

// Allowed transitions: current status -> next statuses.
const transitions: Record<string, string[]> = {
  draft: ["pending", "cancelled"],
  pending: ["paid", "cancelled"],
};

const noStore = { "Cache-Control": "no-store" };

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = statusSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const target = parsed.data.status;
    const allowedFrom = Object.entries(transitions)
      .filter(([, next]) => next.includes(target))
      .map(([current]) => current);

    // The status change and its journal entries commit together or not at all.
    const changed = await prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.updateMany({
        where: { id: params.id, companyId, status: { in: allowedFrom } },
        data: { status: target },
      });
      if (updated.count === 0) return false;

      const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: params.id } });
      if (target === "cancelled") {
        await reverseSourceEntries(tx, { companyId, sourceType: "invoice", sourceId: invoice.id });
      } else {
        await postInvoiceAccounting(tx, invoice);
      }
      return true;
    });

    if (!changed) {
      const existing = await prisma.invoice.findFirst({ where: { id: params.id, companyId }, select: { status: true } });
      if (!existing) {
        return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      }
      return NextResponse.json(
        { error: `لا يمكن تغيير حالة الفاتورة من "${existing.status}" إلى "${target}".` },
        { status: 409 }
      );
    }

    await logAudit({
      userId: auth.user.userId,
      action: "invoice.status",
      entityType: "Invoice",
      entityId: params.id,
      metadata: { status: target },
    });

    return NextResponse.json({ ok: true, status: target }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to update invoice." }, { status: 500 });
  }
}
