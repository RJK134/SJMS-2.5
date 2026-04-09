import prisma from '../../utils/prisma';
import { NotFoundError } from '../../utils/errors';
import { buildPaginatedResponse } from '../../utils/pagination';
import { logAudit } from '../../utils/audit';
import type { Request } from 'express';

export async function list(query: Record<string, any>) {
  const { page, limit, sort, order, ...filters } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, any> = {
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.isRead !== undefined ? { isRead: filters.isRead === 'true' } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    OR: [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } },
    ],
  };
  const [data, total] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: limit, orderBy: { [sort]: order } as any }),
    prisma.notification.count({ where }),
  ]);
  return buildPaginatedResponse(data, total, { page, limit, skip, sort, order });
}

export async function getById(id: string) {
  const result = await prisma.notification.findUnique({ where: { id } });
  if (!result) throw new NotFoundError('Notification', id);
  return result;
}

export async function markAsRead(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
  await logAudit('Notification', id, 'UPDATE', userId, previous, result, req);
  return result;
}

export async function update(id: string, data: any, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await prisma.notification.update({ where: { id }, data });
  await logAudit('Notification', id, 'UPDATE', userId, previous, result, req);
  return result;
}
