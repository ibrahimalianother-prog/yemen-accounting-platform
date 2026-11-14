import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  role: z.enum(["owner", "accountant", "cashier", "sales", "auditor"]).optional(),
});

export async function POST(req: Request) {
  try {
    const payload = registerSchema.parse(await req.json());

    if (!process.env.DATABASE_URL) {
      const defaultCompany = { id: "demo-company-1", name: payload.companyName };
      const user = {
        id: `user-${Date.now()}`,
        fullName: payload.fullName,
        email: payload.email,
        password: await bcrypt.hash(payload.password, 12),
        role: payload.role ?? "accountant",
        companyId: defaultCompany.id,
      };
      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      const response = NextResponse.json({ token, user });
      response.cookies.set("auth_token", token, { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
      return response;
    }

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const company = await prisma.company.create({ data: { name: payload.companyName, currency: "YER" } });
    const user = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        password: await bcrypt.hash(payload.password, 12),
        role: payload.role ?? "accountant",
        companyId: company.id,
      },
    });
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, companyId: company.id } });
    response.cookies.set("auth_token", token, { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Registration failed", details: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
