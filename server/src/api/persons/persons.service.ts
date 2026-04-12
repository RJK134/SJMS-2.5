import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/person.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface PersonListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
}

export async function list(query: PersonListQuery) {
  const { cursor, limit, sort, order, search } = query;
  return repo.list(
    { search },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Person', id);
  return result;
}

export async function create(data: Prisma.PersonUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Person', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('persons.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.PersonUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Person', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('persons.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Person', id, 'DELETE', userId, previous, null, req);
  await emitEvent('persons.deleted', { id });
}
