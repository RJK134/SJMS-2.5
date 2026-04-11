import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/personIdentifier.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface IdentifierListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  personId?: string;
  identifierType?: string;
}

export async function list(query: IdentifierListQuery) {
  const { page, limit, sort, order, search, personId, identifierType } = query;
  return repo.list(
    { search, personId, identifierType },
    { page, limit, skip: (page - 1) * limit, sort, order },
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
  await emitEvent('identifiers.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.PersonIdentifierUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('PersonIdentifier', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('identifiers.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('PersonIdentifier', id, 'DELETE', userId, previous, null, req);
  await emitEvent('identifiers.deleted', { id });
}
