import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/notification.repository';
import { logAudit } from '../../utils/audit';
import { NotFoundError } from '../../utils/errors';

export interface NotificationListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  userId?: string;
  isRead?: boolean;
  category?: string;
  priority?: string;
}

export async function list(query: NotificationListQuery) {
  const { cursor, limit, sort, order, userId, isRead, category, priority } = query;
  return repo.list(
    { userId, isRead, category, priority },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Notification', id);
  return result;
}

export async function markAsRead(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.markAsRead(id);
  await logAudit('Notification', id, 'UPDATE', userId, previous, result, req);
  return result;
}

export async function create(data: Prisma.NotificationUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create({ ...data, createdBy: userId });
  await logAudit('Notification', result.id, 'CREATE', userId, null, result, req);
  return result;
}

export async function update(id: string, data: Prisma.NotificationUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Notification', id, 'UPDATE', userId, previous, result, req);
  return result;
}
