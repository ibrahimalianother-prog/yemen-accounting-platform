import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getActiveCompanyId } from "@/lib/company";
import { requireRole } from "@/lib/server-auth";

const updateSchema = z
  .object({
    role: z.enum(["accountant", "cashier", "sales", "auditor"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.isActive !== undefined, {
    message: "Nothing to update.",
  });

/** Owner-only: change a team member's role or deactivate/reactivate the account. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(req, ["owner"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    }

    if (params.id === auth.user.userId) {
      return NextResponse.json({ error: "لا يمكنك تعديل حسابك الخاص." }, { status: 409 });
    }

    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const target = await prisma.user.findFirst({
      where: { id: params.id, companyId },
      select: { id: true, role: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (target.role === "owner") {
      return NextResponse.json({ error: "لا يمكن تعديل مالك الشركة." }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id: target.id },
      data: parsed.data,
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
    });

    await logAudit({
      userId: auth.user.userId,
      action: "user.update",
      entityType: "User",
      entityId: user.id,
      metadata: parsed.data,
    });

    return NextResponse.json(user, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to update user." }, { status: 500 });
  }
}
