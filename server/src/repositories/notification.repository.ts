import { type Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse, safeOrderBy } from '../utils/pagination';
import { NOTIFICATION_SORT } from '../utils/repository-sort-allow-lists';

// Notification has no deletedAt field — notifications are state-driven
// (isRead / expiresAt) and ephemeral. Hard-delete is intentional when called.

export interface NotificationFilters {
  userId?: string;
  isRead?: boolean;
  category?: string;
  priority?: string;
}

export async function list(filters: NotificationFilters = {}, pagination: CursorPaginationParams) {
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
      
      take: pagination.limit + 1, ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: safeOrderBy(pagination, NOTIFICATION_SORT),
    }),
    prisma.notification.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
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
