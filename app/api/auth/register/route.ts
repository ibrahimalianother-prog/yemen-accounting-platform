import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2).optional(),
  role: z.enum(["owner", "accountant", "cashier", "sales", "auditor"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const authSecret = process.env.AUTH_SECRET ?? "development_secret_change_me";

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, authSecret, { expiresIn: "7d" });
}

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database is not configured yet. Add DATABASE_URL and run Prisma migrate." }, { status: 503 });
    }

    const payload = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return NextResponse.json({ error: "This email is already in use." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(payload.password, 12);
    const company = payload.companyName
      ? await prisma.company.create({ data: { name: payload.companyName, currency: "YER" } })
      : await prisma.company.create({ data: { name: "Default Company", currency: "YER" } });

    const user = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        password: hashed,
        role: payload.role ?? "accountant",
        companyId: company.id,
      },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, companyId: company.id } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed.", details: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
