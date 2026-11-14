import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AuditInput = {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

/** Best-effort audit trail: a logging failure must never break the business operation. */
export async function logAudit({ userId, action, entityType, entityId, metadata }: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, entityType, entityId, metadata },
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}
