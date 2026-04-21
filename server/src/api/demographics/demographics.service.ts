import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/personDemographic.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface DemographicListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  personId?: string;
}

export async function list(query: DemographicListQuery) {
  const { cursor, limit, sort, order, personId } = query;
  return repo.list(
    { personId },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('PersonDemographic', id);
  return result;
}

export async function create(data: Prisma.PersonDemographicUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('PersonDemographic', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'demographics.created',
    entityType: 'PersonDemographic',
    entityId: result.id,
    actorId: userId,
    data: { personId: result.personId },
  });
  return result;
}

export async function update(id: string, data: Prisma.PersonDemographicUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('PersonDemographic', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'demographics.updated',
    entityType: 'PersonDemographic',
    entityId: id,
    actorId: userId,
    data: { personId: result.personId },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('PersonDemographic', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'demographics.deleted',
    entityType: 'PersonDemographic',
    entityId: id,
    actorId: userId,
    data: { personId: previous.personId },
  });
}
