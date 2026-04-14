import prisma from '../utils/prisma';
import type { Prisma } from '@prisma/client';

export async function create(data: Prisma.HESANotificationUncheckedCreateInput) {
  return prisma.hESANotification.create({ data });
}

export async function getById(id: string) {
  return prisma.hESANotification.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function list(
  filters: { entityType?: string; entityId?: string; status?: string },
  pagination: { cursor?: string; limit: number; sort: string; order: 'asc' | 'desc' },
) {
  const where: Prisma.HESANotificationWhereInput = { deletedAt: null };
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.entityId) where.entityId = filters.entityId;
  if (filters.status) where.status = filters.status as Prisma.EnumHESANotificationStatusFilter;

  const orderBy = { [pagination.sort]: pagination.order };
  const take = pagination.limit + 1;

  const items = await prisma.hESANotification.findMany({
    where,
    orderBy,
    take,
    ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
  });

  const hasMore = items.length > pagination.limit;
  const data = hasMore ? items.slice(0, -1) : items;
  return {
    data,
    nextCursor: hasMore ? data[data.length - 1]?.id : null,
  };
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
