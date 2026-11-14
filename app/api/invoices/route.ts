import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";

const invoiceSchema = z.object({
  customerId: z.string().min(1),
  invoiceNumber: z.string().trim().min(1).max(64),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime().optional().nullable(),
  subtotal: z.number().int().nonnegative(),
  taxAmount: z.number().int().nonnegative(),
  totalAmount: z.number().int().nonnegative(),
  status: z.enum(["draft", "pending", "paid", "cancelled"]).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const noStore = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "cashier", "sales", "auditor"]);
  if (!auth.authorized) return auth.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: { companyId: true, isActive: true },
    });

    if (!user?.isActive || !user.companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { companyId: user.companyId },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve invoices." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["owner", "accountant", "sales"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = invoiceSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid invoice data.", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: { companyId: true, isActive: true },
    });

    if (!user?.isActive || !user.companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const body = parsed.data;
    const customer = await prisma.customer.findFirst({
      where: { id: body.customerId, companyId: user.companyId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found in your company." }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        companyId: user.companyId,
        customerId: body.customerId,
        createdById: auth.user.userId,
        invoiceNumber: body.invoiceNumber,
        issueDate: new Date(body.issueDate),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        subtotal: body.subtotal,
        taxAmount: body.taxAmount,
        totalAmount: body.totalAmount,
        status: body.status ?? "draft",
        notes: body.notes ?? null,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201, headers: noStore });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Invoice number is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create invoice." }, { status: 500 });
  }
}
