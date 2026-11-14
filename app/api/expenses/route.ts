import { NextRequest, NextResponse } from "next/server";
import { expenses } from "@/lib/mockData";
import { requireRole } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier", "auditor"]);
  if (!auth.authorized) return auth.response;

  return NextResponse.json(expenses, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier"]);
  if (!auth.authorized) return auth.response;

  const payload = await req.json();
  return NextResponse.json({ message: "Expense created successfully", payload }, { status: 201 });
}
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";

const expenseSchema = z.object({
  vendorId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  createdById: z.string().min(1),
  companyId: z.string().min(1),
  expenseNumber: z.string().min(1),
  expenseDate: z.string().datetime(),
  amount: z.number().int().positive(),
  status: z.enum(["draft", "posted", "cancelled"]).optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier", "auditor"]);
  if (!auth.authorized) return auth.response;

  const expenses = await prisma.expense.findMany({
    include: {
      vendor: true,
      category: true,
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(expenses, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier"]);
  if (!auth.authorized) return auth.response;

  try {
    const body = expenseSchema.parse(await req.json());

    const expense = await prisma.expense.create({
      data: {
        companyId: body.companyId,
        vendorId: body.vendorId,
        categoryId: body.categoryId ?? null,
        createdById: body.createdById,
        expenseNumber: body.expenseNumber,
        expenseDate: new Date(body.expenseDate),
        amount: body.amount,
        status: body.status ?? "draft",
        notes: body.notes ?? null,
      },
      include: {
        vendor: true,
        category: true,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create expense",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }
}
