import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

// AuditLog is append-only and intentionally has NO softDelete, update,
// or remove operations — audit trails must never be mutated or removed.

export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
}

export async function list(filters: AuditLogFilters = {}, pagination: PaginationParams) {
  const where: Prisma.AuditLogWhereInput = {
    ...(filters.entityType && { entityType: filters.entityType }),
    ...(filters.entityId && { entityId: filters.entityId }),
    ...(filters.action && { action: filters.action as any }),
    ...(filters.userId && { userId: filters.userId }),
    ...((filters.fromDate || filters.toDate) && {
      timestamp: {
        ...(filters.fromDate && { gte: new Date(filters.fromDate) }),
        ...(filters.toDate && { lte: new Date(filters.toDate) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
      select: {
        id: true,
        entityType: true,
        entityId: true,
        action: true,
        userId: true,
        userRole: true,
        ipAddress: true,
        timestamp: true,
        previousData: true,
        newData: true,
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}
