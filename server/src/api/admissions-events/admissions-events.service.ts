import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/admissionsEvent.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface AdmissionsEventListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  eventType?: string;
}

export async function list(query: AdmissionsEventListQuery) {
  const { cursor, limit, sort, order, search, eventType } = query;
  return repo.list(
    { search, eventType },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('AdmissionsEvent', id);
  return result;
}

export async function create(data: Prisma.AdmissionsEventUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('AdmissionsEvent', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'admissions_events.created',
    entityType: 'AdmissionsEvent',
    entityId: result.id,
    actorId: userId,
    data: { eventType: result.eventType, title: result.title },
  });
  return result;
}

export async function update(id: string, data: Prisma.AdmissionsEventUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('AdmissionsEvent', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'admissions_events.updated',
    entityType: 'AdmissionsEvent',
    entityId: id,
    actorId: userId,
    data: { eventType: result.eventType, title: result.title },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('AdmissionsEvent', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'admissions_events.deleted',
    entityType: 'AdmissionsEvent',
    entityId: id,
    actorId: userId,
    data: { status: 'DELETED' },
  });
}
