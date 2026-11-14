import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAccounts, isExpenseAccount } from "@/lib/accounting";
import { logAudit } from "@/lib/audit";
import { getActiveCompanyId } from "@/lib/company";
import { requireRole } from "@/lib/server-auth";

const updateSchema = z.object({ accountCode: z.string().trim().min(1).max(16).nullable() });

/** Maps one of the company's own categories to an expense account (null clears the mapping). */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid account code." }, { status: 400 });
    }

    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const category = await prisma.expenseCategory.findFirst({
      where: { id: params.id, OR: [{ companyId }, { companyId: null }] },
      select: { id: true, companyId: true },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }
    if (!category.companyId) {
      return NextResponse.json({ error: "الفئات المشتركة تُرحَّل إلى حساب المصروفات العامة ولا يمكن ربطها." }, { status: 409 });
    }

    const { accountCode } = parsed.data;
    if (accountCode) {
      await ensureDefaultAccounts(prisma, companyId);
      if (!(await isExpenseAccount(prisma, companyId, accountCode))) {
        return NextResponse.json({ error: "الحساب يجب أن يكون حساب مصروفات نشطاً في دليل الحسابات." }, { status: 400 });
      }
    }

    const updated = await prisma.expenseCategory.update({
      where: { id: category.id },
      data: { accountCode },
    });

    await logAudit({
      userId: auth.user.userId,
      action: "expenseCategory.map",
      entityType: "ExpenseCategory",
      entityId: updated.id,
      metadata: { accountCode },
    });

    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to update category." }, { status: 500 });
  }
}
