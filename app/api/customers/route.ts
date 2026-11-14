import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server-auth";
import { logAudit } from "@/lib/audit";

const customerSchema = z.object({
  name: z.string().trim().min(1).max(128),
  phone: z.string().trim().max(64).nullable().optional(),
  email: z.string().email().max(256).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
});

const noStore = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant", "sales", "auditor"]);
  if (!auth.authorized) return auth.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: { companyId: true, isActive: true },
    });

    if (!user?.isActive || !user.companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const customers = await prisma.customer.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve customers." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant", "sales"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = customerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid customer data.", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: { companyId: true, isActive: true },
    });

    if (!user?.isActive || !user.companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const customer = await prisma.customer.create({
      data: {
        companyId: user.companyId,
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        address: parsed.data.address ?? null,
      },
    });

    await logAudit({
      userId: auth.user.userId,
      action: "customer.create",
      entityType: "Customer",
      entityId: customer.id,
    });

    return NextResponse.json(customer, { status: 201, headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to create customer." }, { status: 500 });
  }
}
