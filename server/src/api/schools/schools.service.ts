import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/school.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface SchoolListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  facultyId?: string;
}

export async function list(query: SchoolListQuery) {
  const { cursor, limit, sort, order, search, facultyId } = query;
  return repo.list(
    { search, facultyId },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('School', id);
  return result;
}

export async function create(data: Prisma.SchoolUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('School', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('schools.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.SchoolUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('School', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('schools.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('School', id, 'DELETE', userId, previous, null, req);
  await emitEvent('schools.deleted', { id });
}
