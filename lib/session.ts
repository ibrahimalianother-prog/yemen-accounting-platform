import { redirect } from "next/navigation";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const ALL_ROLES = ["owner", "accountant", "cashier", "sales", "auditor"];

/**
 * Resolves the signed-in user and their company on the server.
 * Redirects to /login without a valid session, and to /dashboard when the
 * user's role is not in `allowedRoles`.
 */
export async function requireCompanyContext(allowedRoles: string[] = ALL_ROLES) {
  const session = getCurrentUserFromCookies();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          taxNumber: true,
          currency: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user || !user.isActive || !user.companyId || !user.company) redirect("/login");

  if (!ALL_ROLES.includes(user.role)) redirect("/login");
  if (!allowedRoles.includes(user.role)) redirect("/dashboard");

  return { user, company: user.company, companyId: user.companyId, role: user.role };
}
