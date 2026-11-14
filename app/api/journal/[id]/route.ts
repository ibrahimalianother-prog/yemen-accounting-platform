import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getActiveCompanyId } from "@/lib/company";
import { requireRole } from "@/lib/server-auth";

const actionSchema = z.object({ action: z.enum(["post", "cancel", "reverse"]) });

const noStore = { "Cache-Control": "no-store" };

/**
 * Posted entries are immutable: lines and amounts can never change. A draft can be posted or
 * cancelled; a posted entry can only be reversed by a new, balanced, opposite entry.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = actionSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const { action } = parsed.data;

    if (action === "reverse") {
      const entry = await prisma.journalEntry.findFirst({
        where: { id: params.id, companyId },
        include: { lines: true },
      });

      if (!entry) {
        return NextResponse.json({ error: "Journal entry not found." }, { status: 404 });
      }
      if (entry.status !== "posted" || entry.reversalOfId) {
        return NextResponse.json({ error: "يمكن عكس القيود المرحّلة الأصلية فقط." }, { status: 409 });
      }

      const reversal = await prisma.journalEntry.create({
        data: {
          companyId,
          entryNumber: `${entry.entryNumber}-REV`,
          entryDate: new Date(),
          description: `عكس القيد ${entry.entryNumber}`,
          status: "posted",
          reversalOfId: entry.id,
          lines: {
            create: entry.lines.map((line) => ({
              accountCode: line.accountCode,
              accountName: line.accountName,
              debit: line.credit,
              credit: line.debit,
              description: line.description,
            })),
          },
        },
      });

      await logAudit({
        userId: auth.user.userId,
        action: "journal.reverse",
        entityType: "JournalEntry",
        entityId: entry.id,
        metadata: { reversalId: reversal.id, reversalNumber: reversal.entryNumber },
      });

      return NextResponse.json({ ok: true, reversalNumber: reversal.entryNumber }, { status: 201, headers: noStore });
    }

    const target = action === "post" ? "posted" : "cancelled";
    const result = await prisma.journalEntry.updateMany({
      where: { id: params.id, companyId, status: "draft" },
      data: { status: target },
    });

    if (result.count === 0) {
      const existing = await prisma.journalEntry.findFirst({ where: { id: params.id, companyId }, select: { status: true } });
      if (!existing) {
        return NextResponse.json({ error: "Journal entry not found." }, { status: 404 });
      }
      return NextResponse.json({ error: "يمكن ترحيل أو إلغاء المسودات فقط." }, { status: 409 });
    }

    await logAudit({
      userId: auth.user.userId,
      action: `journal.${action}`,
      entityType: "JournalEntry",
      entityId: params.id,
      metadata: { status: target },
    });

    return NextResponse.json({ ok: true, status: target }, { headers: noStore });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "القيد معكوس مسبقاً أو رقم القيد العكسي مستخدم." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to update journal entry." }, { status: 500 });
  }
}
