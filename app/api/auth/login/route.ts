import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const payload = loginSchema.parse(await req.json());

    let user: {
      id: string;
      email: string;
      password: string;
      role: string;
      fullName: string;
      companyId: string | null;
    } | null = null;

    if (process.env.DATABASE_URL) {
      user = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
      }

      const valid = await bcrypt.compare(payload.password, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
      }
    } else {
      const fallbackUser = {
        id: "demo-user-1",
        fullName: "مدير النظام",
        email: "admin@yemenaccounting.com",
        password: await bcrypt.hash("123456", 12),
        role: "owner",
        companyId: "demo-company-1",
      };

      const valid =
        payload.email === fallbackUser.email &&
        (await bcrypt.compare(payload.password, fallbackUser.password));

      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
      }

      user = fallbackUser;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
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
        error: "Login failed.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    );
  }
}
