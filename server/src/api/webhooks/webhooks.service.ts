import type { Request } from 'express';
import * as repo from '../../repositories/webhookSubscription.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';
import type { Prisma } from '@prisma/client';

export interface WebhookListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  isActive?: string;
  eventType?: string;
}

export async function list(query: WebhookListQuery) {
  const { cursor, limit, sort, order, ...filters } = query;
  return repo.list(filters, { cursor, limit, sort, order });
}

export async function getById(id: string) {
  const record = await repo.getById(id);
  if (!record) throw new NotFoundError('WebhookSubscription', id);
  return record;
}

export async function create(data: Prisma.WebhookSubscriptionUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('WebhookSubscription', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'webhooks.created',
    entityType: 'WebhookSubscription',
    entityId: result.id,
    actorId: userId,
    data: {
      eventType: (result as { eventType?: string }).eventType ?? null,
      isActive: (result as { isActive?: boolean }).isActive ?? null,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.WebhookSubscriptionUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('WebhookSubscription', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'webhooks.updated',
    entityType: 'WebhookSubscription',
    entityId: id,
    actorId: userId,
    data: {
      eventType: (result as { eventType?: string }).eventType ?? null,
      isActive: (result as { isActive?: boolean }).isActive ?? null,
    },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('WebhookSubscription', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'webhooks.deleted',
    entityType: 'WebhookSubscription',
    entityId: id,
    actorId: userId,
    data: { eventType: (previous as { eventType?: string }).eventType ?? null },
  });
}
