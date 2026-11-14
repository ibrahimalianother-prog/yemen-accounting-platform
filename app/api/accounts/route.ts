import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_TYPES, ensureDefaultAccounts } from "@/lib/accounting";
import { logAudit } from "@/lib/audit";
import { getActiveCompanyId } from "@/lib/company";
import { requireRole } from "@/lib/server-auth";

const accountSchema = z.object({
  code: z.string().trim().regex(/^[0-9A-Za-z.-]{1,16}$/),
  name: z.string().trim().min(1).max(128),
  type: z.enum(ACCOUNT_TYPES),
});

const noStore = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant", "cashier", "auditor"]);
  if (!auth.authorized) return auth.response;

  try {
    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    await ensureDefaultAccounts(prisma, companyId);
    const accounts = await prisma.account.findMany({ where: { companyId }, orderBy: { code: "asc" } });

    return NextResponse.json(accounts, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve accounts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = accountSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid account data.", details: parsed.error.flatten() }, { status: 400 });
    }

    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    await ensureDefaultAccounts(prisma, companyId);
    const account = await prisma.account.create({ data: { ...parsed.data, companyId } });

    await logAudit({
      userId: auth.user.userId,
      action: "account.create",
      entityType: "Account",
      entityId: account.id,
      metadata: { code: account.code, name: account.name, type: account.type },
    });

    return NextResponse.json(account, { status: 201, headers: noStore });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "رمز الحساب مستخدم مسبقاً." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
