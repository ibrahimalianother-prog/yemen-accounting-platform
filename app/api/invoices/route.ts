import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";
import { logAudit } from "@/lib/audit";
import { postInvoiceAccounting } from "@/lib/accounting";

// PostgreSQL INTEGER upper bound; amounts are stored as whole currency units.
const MAX_INT = 2_147_483_647;
const money = z.number().int().nonnegative().max(MAX_INT);

const invoiceSchema = z.object({
  customerId: z.string().min(1),
  invoiceNumber: z.string().trim().min(1).max(64),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime().optional().nullable(),
  // Either send `items` (subtotal is computed on the server) or a plain `subtotal`.
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1).max(256),
        quantity: z.number().int().positive().max(1_000_000),
        unitPrice: money,
      })
    )
    .max(100)
    .optional(),
  subtotal: money.optional(),
  taxAmount: money.optional(),
  status: z.enum(["draft", "pending", "paid", "cancelled"]).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const noStore = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant", "cashier", "sales", "auditor"]);
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
  const auth = await requireRole(req, ["owner", "accountant", "sales"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = invoiceSchema.safeParse(await req.json().catch(() => null));
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

    const companyId = user.companyId;
    const userId = auth.user.userId;
    const body = parsed.data;
    const items = body.items ?? [];
    const subtotal = items.length > 0 ? items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) : body.subtotal;

    if (subtotal === undefined) {
      return NextResponse.json({ error: "Provide invoice items or a subtotal." }, { status: 400 });
    }

    const taxAmount = body.taxAmount ?? 0;
    const totalAmount = subtotal + taxAmount;
    if (totalAmount > MAX_INT) {
      return NextResponse.json({ error: "Invoice total is too large." }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { id: body.customerId, companyId: user.companyId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found in your company." }, { status: 400 });
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
      data: {
        companyId,
        customerId: body.customerId,
        createdById: userId,
        invoiceNumber: body.invoiceNumber,
        issueDate: new Date(body.issueDate),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        subtotal,
        taxAmount,
        totalAmount,
        status: body.status ?? "draft",
        notes: body.notes ?? null,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
      });
      await postInvoiceAccounting(tx, created);
      return created;
    });

    await logAudit({
      userId: auth.user.userId,
      action: "invoice.create",
      entityType: "Invoice",
      entityId: invoice.id,
      metadata: { invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount },
    });

    return NextResponse.json(invoice, { status: 201, headers: noStore });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Invoice number is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create invoice." }, { status: 500 });
  }
}
