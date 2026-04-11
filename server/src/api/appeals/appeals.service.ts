import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/appeal.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface AppealListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  status?: string;
  appealType?: string;
}

export async function list(query: AppealListQuery) {
  const { page, limit, sort, order, studentId, status, appealType } = query;
  return repo.list(
    { studentId, status, appealType },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Appeal', id);
  return result;
}

export async function create(data: Prisma.AppealUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Appeal', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('appeals.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.AppealUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Appeal', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('appeals.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Appeal', id, 'DELETE', userId, previous, null, req);
  await emitEvent('appeals.deleted', { id });
}
