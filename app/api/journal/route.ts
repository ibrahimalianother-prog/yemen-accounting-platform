import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";
import { logAudit } from "@/lib/audit";
import { ensureDefaultAccounts } from "@/lib/accounting";

const journalSchema = z.object({
  entryNumber: z.string().trim().min(1).max(64),
  entryDate: z.string().datetime(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(["draft", "posted", "cancelled"]).optional(),
  lines: z.array(
    z.object({
      accountCode: z.string().trim().min(1).max(32),
      // Ignored by the server: the name always comes from the chart of accounts.
      accountName: z.string().trim().max(128).optional(),
      debit: z.number().int().nonnegative().max(2_147_483_647).default(0),
      credit: z.number().int().nonnegative().max(2_147_483_647).default(0),
      description: z.string().trim().max(2000).nullable().optional(),
    }).refine((line) => (line.debit > 0) !== (line.credit > 0), {
      message: "Each line must have either a debit or a credit amount.",
    })
  ).min(2),
}).refine(
  (entry) =>
    entry.lines.reduce((sum, line) => sum + line.debit, 0) ===
    entry.lines.reduce((sum, line) => sum + line.credit, 0),
  { message: "Journal entry must be balanced: total debits must equal total credits." }
);

const noStore = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant", "cashier", "auditor"]);
  if (!auth.authorized) return auth.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: { companyId: true, isActive: true },
    });

    if (!user?.isActive || !user.companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const entries = await prisma.journalEntry.findMany({
      where: { companyId: user.companyId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve journal entries." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = journalSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid journal entry data.", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: { companyId: true, isActive: true },
    });

    if (!user?.isActive || !user.companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const body = parsed.data;

    await ensureDefaultAccounts(prisma, user.companyId);
    const codes = Array.from(new Set(body.lines.map((line) => line.accountCode)));
    const accounts = await prisma.account.findMany({
      where: { companyId: user.companyId, code: { in: codes }, isActive: true },
      select: { code: true, name: true },
    });
    const accountNames = new Map(accounts.map((account) => [account.code, account.name]));
    const unknown = codes.filter((code) => !accountNames.has(code));
    if (unknown.length > 0) {
      return NextResponse.json(
        { error: `حسابات غير موجودة في دليل الحسابات: ${unknown.join(", ")}` },
        { status: 400 }
      );
    }

    const entry = await prisma.journalEntry.create({
      data: {
        companyId: user.companyId,
        entryNumber: body.entryNumber,
        entryDate: new Date(body.entryDate),
        description: body.description ?? null,
        status: body.status ?? "draft",
        lines: {
          create: body.lines.map((line) => ({
            accountCode: line.accountCode,
            accountName: accountNames.get(line.accountCode) ?? line.accountCode,
            debit: line.debit,
            credit: line.credit,
            description: line.description ?? null,
          })),
        },
      },
      include: { lines: true },
    });

    await logAudit({
      userId: auth.user.userId,
      action: "journal.create",
      entityType: "JournalEntry",
      entityId: entry.id,
      metadata: { entryNumber: entry.entryNumber, status: entry.status },
    });

    return NextResponse.json(entry, { status: 201, headers: noStore });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Journal entry number is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create journal entry." }, { status: 500 });
  }
}
