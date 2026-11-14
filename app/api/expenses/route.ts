import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";
import { logAudit } from "@/lib/audit";
import { postExpenseAccounting } from "@/lib/accounting";

const expenseSchema = z.object({
  vendorId: z.string().min(1),
  categoryId: z.string().min(1).nullable().optional(),
  expenseNumber: z.string().trim().min(1).max(64),
  expenseDate: z.string().datetime(),
  amount: z.number().int().positive().max(2_147_483_647),
  status: z.enum(["draft", "posted", "cancelled"]).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

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
      return NextResponse.json(
        { error: "Account is not associated with an active company." },
        { status: 403 }
      );
    }

    const expenses = await prisma.expense.findMany({
      where: { companyId: user.companyId },
      include: {
        vendor: true,
        category: true,
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(expenses, { headers: noStore });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve expenses." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant", "cashier"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = expenseSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid expense data.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: { companyId: true, isActive: true },
    });

    if (!user?.isActive || !user.companyId) {
      return NextResponse.json(
        { error: "Account is not associated with an active company." },
        { status: 403 }
      );
    }

    const companyId = user.companyId;
    const userId = auth.user.userId;
    const body = parsed.data;
    const vendor = await prisma.vendor.findFirst({
      where: { id: body.vendorId, companyId: user.companyId },
      select: { id: true },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found in your company." },
        { status: 400 }
      );
    }

    if (body.categoryId) {
      const category = await prisma.expenseCategory.findFirst({
        where: { id: body.categoryId, OR: [{ companyId: user.companyId }, { companyId: null }] },
        select: { id: true },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Expense category not found." },
          { status: 400 }
        );
      }
    }

    const expense = await prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
      data: {
        companyId,
        vendorId: body.vendorId,
        categoryId: body.categoryId ?? null,
        createdById: userId,
        expenseNumber: body.expenseNumber,
        expenseDate: new Date(body.expenseDate),
        amount: body.amount,
        status: body.status ?? "draft",
        notes: body.notes ?? null,
      },
      include: { vendor: true, category: true },
      });
      await postExpenseAccounting(tx, created);
      return created;
    });

    await logAudit({
      userId: auth.user.userId,
      action: "expense.create",
      entityType: "Expense",
      entityId: expense.id,
      metadata: { expenseNumber: expense.expenseNumber, amount: expense.amount },
    });

    return NextResponse.json(expense, { status: 201, headers: noStore });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Expense number is already in use." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create expense." },
      { status: 500 }
    );
  }
}
