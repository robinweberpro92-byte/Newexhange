import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type LogAdminActionInput = {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function logAdminAction(input: LogAdminActionInput) {
  await prisma.adminLog.create({
    data: {
      adminId: input.adminId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details as any,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    }
  });
}
