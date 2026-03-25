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
entityId: input.entityId ?? null,
details: input.details
? JSON.parse(JSON.stringify(input.details))
: undefined,
ipAddress: input.ipAddress ?? null,
userAgent: input.userAgent ?? null
}
});
}
