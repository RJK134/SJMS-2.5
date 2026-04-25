import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/programme.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ProgrammeListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  level?: string;
  departmentId?: string;
}

export async function list(query: ProgrammeListQuery) {
  const { cursor, limit, sort, order, search, status, level, departmentId } = query;
  return repo.list(
    { search, status, level, departmentId },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Programme', id);
  return result;
}

export async function create(data: Prisma.ProgrammeUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Programme', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'programmes.created',
    entityType: 'Programme',
    entityId: result.id,
    actorId: userId,
    data: { title: result.title, level: result.level, status: result.status },
  });
  return result;
}

export async function update(id: string, data: Prisma.ProgrammeUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Programme', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'programmes.updated',
    entityType: 'Programme',
    entityId: id,
    actorId: userId,
    data: { title: result.title, status: result.status },
  });
  if (result.status !== previous.status) {
    emitEvent({
      event: 'programmes.status_changed',
      entityType: 'Programme',
      entityId: id,
      actorId: userId,
      data: { previousStatus: previous.status, newStatus: result.status },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Programme', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'programmes.deleted',
    entityType: 'Programme',
    entityId: id,
    actorId: userId,
    data: { title: previous.title },
  });
}
