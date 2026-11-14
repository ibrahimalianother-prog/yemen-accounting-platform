import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const demoUser = {
  id: "demo-user-1",
  fullName: "مدير النظام",
  email: "admin@yemenaccounting.com",
  password: "$2a$12$3Y4fp4D8cow7mOruC0Egl.7J3w1sQd8yYl8lkrh2QFK2vT3v0dW4W",
  role: "owner",
  companyId: "demo-company-1",
};

export async function POST(req: Request) {
  try {
    const payload = loginSchema.parse(await req.json());

    if (process.env.DATABASE_URL) {
      const user = await prisma.user.findUnique({ where: { email: payload.email } });
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const valid = await bcrypt.compare(payload.password, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      const response = NextResponse.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, companyId: user.companyId } });
      response.cookies.set("auth_token", token, { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
      return response;
    }

    const valid = payload.email === demoUser.email && payload.password === "123456";
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ userId: demoUser.id, email: demoUser.email, role: demoUser.role });
    const response = NextResponse.json({ token, user: { id: demoUser.id, email: demoUser.email, fullName: demoUser.fullName, role: demoUser.role, companyId: demoUser.companyId } });
    response.cookies.set("auth_token", token, { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Login failed", details: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
