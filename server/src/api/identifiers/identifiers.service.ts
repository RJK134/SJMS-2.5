import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/personIdentifier.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface IdentifierListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  personId?: string;
  identifierType?: string;
}

export async function list(query: IdentifierListQuery) {
  const { cursor, limit, sort, order, search, personId, identifierType } = query;
  return repo.list(
    { search, personId, identifierType },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('PersonIdentifier', id);
  return result;
}

export async function create(data: Prisma.PersonIdentifierUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('PersonIdentifier', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'identifiers.created',
    entityType: 'PersonIdentifier',
    entityId: result.id,
    actorId: userId,
    data: { personId: result.personId, identifierType: result.identifierType },
  });
  return result;
}

export async function update(id: string, data: Prisma.PersonIdentifierUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('PersonIdentifier', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'identifiers.updated',
    entityType: 'PersonIdentifier',
    entityId: id,
    actorId: userId,
    data: { personId: result.personId, identifierType: result.identifierType },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('PersonIdentifier', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'identifiers.deleted',
    entityType: 'PersonIdentifier',
    entityId: id,
    actorId: userId,
    data: { personId: previous.personId, identifierType: previous.identifierType },
  });
}
