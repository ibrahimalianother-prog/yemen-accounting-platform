import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getActiveCompanyId } from "@/lib/company";
import { requireRole } from "@/lib/server-auth";

const categorySchema = z.object({ name: z.string().trim().min(1).max(64) });

const noStore = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant", "cashier", "auditor"]);
  if (!auth.authorized) return auth.response;

  try {
    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const categories = await prisma.expenseCategory.findMany({
      where: { OR: [{ companyId }, { companyId: null }] },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve categories." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = categorySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid category name." }, { status: 400 });
    }

    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const existing = await prisma.expenseCategory.findFirst({
      where: {
        name: { equals: parsed.data.name, mode: "insensitive" },
        OR: [{ companyId }, { companyId: null }],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "هذه الفئة موجودة مسبقاً." }, { status: 409 });
    }

    const category = await prisma.expenseCategory.create({
      data: { name: parsed.data.name, companyId },
    });

    await logAudit({
      userId: auth.user.userId,
      action: "expenseCategory.create",
      entityType: "ExpenseCategory",
      entityId: category.id,
      metadata: { name: category.name },
    });

    return NextResponse.json(category, { status: 201, headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to create category." }, { status: 500 });
  }
}
