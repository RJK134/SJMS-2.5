import prisma from './prisma';
import type { Request } from 'express';

export async function logAudit(
  entityType: string,
  entityId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT',
  userId: string | undefined,
  previousData: unknown | null,
  newData: unknown | null,
  req?: Request,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        userId: userId ?? null,
        userRole: (req?.user as any)?.realm_access?.roles?.[0] ?? null,
        ipAddress: req?.ip ?? null,
        userAgent: req?.get('user-agent') ?? null,
        previousData: previousData ? JSON.parse(JSON.stringify(previousData)) : undefined,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : undefined,
      },
    });
  } catch {
    // Audit logging should never break the main operation
  }
}
