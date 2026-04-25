import prisma from '../utils/prisma';
import type { Prisma } from '@prisma/client';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';

export async function create(data: Prisma.HESANotificationUncheckedCreateInput) {
  return prisma.hESANotification.create({ data });
}

export async function getById(id: string) {
  return prisma.hESANotification.findFirst({
    where: { id, deletedAt: null },
  });
}

export interface HESANotificationFilters {
  entityType?: string;
  entityId?: string;
  status?: string;
}

export async function list(filters: HESANotificationFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.HESANotificationWhereInput = {
    deletedAt: null,
    ...(filters.entityType && { entityType: filters.entityType }),
    ...(filters.entityId && { entityId: filters.entityId }),
    ...(filters.status && { status: filters.status as Prisma.EnumHESANotificationStatusFilter }),
  };

  const [data, total] = await Promise.all([
    prisma.hESANotification.findMany({
      where,
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, ['id', 'createdAt', 'updatedAt', 'triggerDate', 'startDate', 'dayOfWeek', 'timestamp', 'settingKey', 'postedDate', 'dueDate', 'contactDate'] as const),
    }),
    prisma.hESANotification.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function update(id: string, data: Prisma.HESANotificationUpdateInput) {
  return prisma.hESANotification.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.hESANotification.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
