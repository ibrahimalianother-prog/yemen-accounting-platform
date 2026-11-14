import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const registerSchema = z.object({
  fullName: z.string().trim().min(3).max(128),
  email: z.string().trim().toLowerCase().email().max(256),
  password: z.string().min(8).max(128),
  companyName: z.string().trim().min(2).max(128),
});

export async function POST(req: Request) {
  const limit = rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "محاولات كثيرة. حاول مرة أخرى لاحقاً." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات التسجيل غير صالحة.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  try {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: payload.email, mode: "insensitive" } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "This email is already in use." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    // The company and its owner are created together or not at all.
    const { company, user } = await prisma.$transaction(async (tx) => {
      const createdCompany = await tx.company.create({
        data: { name: payload.companyName, currency: "YER" },
      });

      const createdUser = await tx.user.create({
        data: {
          fullName: payload.fullName,
          email: payload.email,
          password: passwordHash,
          role: "owner",
          companyId: createdCompany.id,
        },
      });

      return { company: createdCompany, user: createdUser };
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          companyId: company.id,
        },
      },
      { status: 201 }
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "This email is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
