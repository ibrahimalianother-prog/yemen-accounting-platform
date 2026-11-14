import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const registerSchema = z.object({
  fullName: z.string().trim().min(3).max(128),
  email: z.string().email().max(256),
  password: z.string().min(8).max(128),
  companyName: z.string().trim().min(2).max(128),
});

export async function POST(req: Request) {
  try {
    const payload = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existing) {
      return NextResponse.json({ error: "This email is already in use." }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name: payload.companyName,
        currency: "YER",
      },
    });

    const user = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        password: await bcrypt.hash(payload.password, 12),
        role: "accountant",
        companyId: company.id,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyId: company.id,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Registration failed.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }
}
