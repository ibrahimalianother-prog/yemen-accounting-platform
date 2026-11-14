import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const authSecret = process.env.AUTH_SECRET ?? "development_secret_change_me";

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database is not configured yet. Add DATABASE_URL and run Prisma migrate." }, { status: 503 });
    }

    const payload = loginSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(payload.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, authSecret, { expiresIn: "7d" });
    return NextResponse.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, companyId: user.companyId } });
  } catch (error) {
    return NextResponse.json({ error: "Login failed.", details: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
