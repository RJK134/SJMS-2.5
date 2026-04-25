import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { Request } from 'express';
import { getRequestId } from './request-context';

function withAuditMetadata(
  data: unknown,
  requestId?: string,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (data == null) return undefined;

  const serialised = JSON.parse(JSON.stringify(data)) as unknown;
  if (!requestId) return serialised as Prisma.InputJsonValue;

  if (serialised && typeof serialised === 'object' && !Array.isArray(serialised)) {
    return {
      ...(serialised as Record<string, unknown>),
      _meta: { requestId },
    };
  }

  return {
    value: serialised,
    _meta: { requestId },
  } as Prisma.InputJsonValue;
}

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
    const requestId = req?.requestId ?? getRequestId();
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        userId: userId ?? null,
        userRole: (req?.user as any)?.realm_access?.roles?.[0] ?? null,
        ipAddress: req?.ip ?? null,
        userAgent: req?.get('user-agent') ?? null,
        previousData: withAuditMetadata(previousData, requestId),
        newData: withAuditMetadata(newData, requestId),
      },
    });
  } catch {
    // Audit logging should never break the main operation
  }
}
