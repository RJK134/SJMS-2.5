import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/hesaNotification.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface HesaNotificationListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  entityType?: string;
  entityId?: string;
  status?: string;
}

export async function list(query: HesaNotificationListQuery) {
  const { cursor, limit, sort, order, entityType, entityId, status } = query;
  return repo.list(
    { entityType, entityId, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('HESANotification', id);
  return result;
}

export async function create(data: Prisma.HESANotificationUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create({ ...data, createdBy: userId });
  await logAudit('HESANotification', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'hesa.notification_queued',
    entityType: 'HESANotification',
    entityId: result.id,
    actorId: userId,
    data: {
      entityType: result.entityType,
      entityId: result.entityId,
      changeType: result.changeType,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.HESANotificationUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('HESANotification', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'hesa.notification_updated',
    entityType: 'HESANotification',
    entityId: id,
    actorId: userId,
    data: {
      entityType: result.entityType,
      entityId: result.entityId,
      status: result.status,
    },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('HESANotification', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'hesa.notification_deleted',
    entityType: 'HESANotification',
    entityId: id,
    actorId: userId,
    data: {
      entityType: previous.entityType,
      entityId: previous.entityId,
    },
  });
}
