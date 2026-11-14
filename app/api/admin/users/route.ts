import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getActiveCompanyId } from "@/lib/company";
import { requireRole } from "@/lib/server-auth";

const noStore = { "Cache-Control": "no-store" };

const createUserSchema = z.object({
  fullName: z.string().trim().min(3).max(128),
  email: z.string().trim().toLowerCase().email().max(256),
  password: z.string().min(8).max(128),
  role: z.enum(["accountant", "cashier", "sales", "auditor"]),
});

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["owner", "accountant"]);
  if (!auth.authorized) return auth.response;

  try {
    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ users }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve users." }, { status: 500 });
  }
}

/** Owners add team members to their own company; the owner role itself cannot be granted here. */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["owner"]);
  if (!auth.authorized) return auth.response;

  try {
    const parsed = createUserSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid user data.", details: parsed.error.flatten() }, { status: 400 });
    }

    const companyId = await getActiveCompanyId(auth.user.userId);
    if (!companyId) {
      return NextResponse.json({ error: "Account is not associated with an active company." }, { status: 403 });
    }

    const existing = await prisma.user.findFirst({
      where: { email: { equals: parsed.data.email, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "This email is already in use." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        companyId,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password: await bcrypt.hash(parsed.data.password, 12),
        role: parsed.data.role,
      },
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
    });

    await logAudit({
      userId: auth.user.userId,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    return NextResponse.json(user, { status: 201, headers: noStore });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "This email is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create user." }, { status: 500 });
  }
}
