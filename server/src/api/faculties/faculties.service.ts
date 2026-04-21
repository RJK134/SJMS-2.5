import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/faculty.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface FacultyListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
}

export async function list(query: FacultyListQuery) {
  const { cursor, limit, sort, order, search } = query;
  return repo.list(
    { search },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Faculty', id);
  return result;
}

export async function create(data: Prisma.FacultyUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Faculty', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'faculties.created',
    entityType: 'Faculty',
    entityId: result.id,
    actorId: userId,
    data: { title: result.title },
  });
  return result;
}

export async function update(id: string, data: Prisma.FacultyUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Faculty', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'faculties.updated',
    entityType: 'Faculty',
    entityId: id,
    actorId: userId,
    data: { title: result.title },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Faculty', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'faculties.deleted',
    entityType: 'Faculty',
    entityId: id,
    actorId: userId,
    data: { title: previous.title },
  });
}
