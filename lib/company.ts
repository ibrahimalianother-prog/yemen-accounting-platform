import { prisma } from "@/lib/prisma";

/** Returns the company of an active user, or null when the account is disabled or has no company. */
export async function getActiveCompanyId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true, isActive: true },
  });

  return user?.isActive && user.companyId ? user.companyId : null;
}
