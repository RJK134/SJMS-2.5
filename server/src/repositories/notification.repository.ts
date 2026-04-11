import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';

// Notification has no deletedAt field — notifications are state-driven
// (isRead / expiresAt) and ephemeral. Hard-delete is intentional when called.

export interface NotificationFilters {
  userId?: string;
  isRead?: boolean;
  category?: string;
  priority?: string;
}

export async function list(filters: NotificationFilters = {}, pagination: PaginationParams) {
  const where: Prisma.NotificationWhereInput = {
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.isRead !== undefined && { isRead: filters.isRead }),
    ...(filters.category && { category: filters.category as any }),
    ...(filters.priority && { priority: filters.priority as any }),
    OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
  };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.notification.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, pagination);
}

export async function getById(id: string) {
  return prisma.notification.findUnique({ where: { id } });
}

export async function create(data: Prisma.NotificationUncheckedCreateInput) {
  return prisma.notification.create({ data });
}

export async function update(id: string, data: Prisma.NotificationUpdateInput) {
  return prisma.notification.update({ where: { id }, data });
}

export async function markAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
}
