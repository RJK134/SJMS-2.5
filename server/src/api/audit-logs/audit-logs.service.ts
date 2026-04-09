import prisma from '../../utils/prisma';
import { buildPaginatedResponse } from '../../utils/pagination';

export async function list(query: Record<string, any>) {
  const { page, limit, sort, order, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    ...(filters.entityType ? { entityType: filters.entityType } : {}),
    ...(filters.entityId ? { entityId: filters.entityId } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.fromDate || filters.toDate ? {
      timestamp: {
        ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
      },
    } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order } as any,
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
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}
