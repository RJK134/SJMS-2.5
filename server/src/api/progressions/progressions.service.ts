import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/progressionRecord.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ProgressionListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  enrolmentId?: string;
  decision?: string;
}

export async function list(query: ProgressionListQuery) {
  const { page, limit, sort, order, enrolmentId, decision } = query;
  return repo.list(
    { enrolmentId, decision },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ProgressionRecord', id);
  return result;
}

export async function create(data: Prisma.ProgressionRecordUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ProgressionRecord', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('progressions.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ProgressionRecordUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ProgressionRecord', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('progressions.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ProgressionRecord', id, 'DELETE', userId, previous, null, req);
  await emitEvent('progressions.deleted', { id });
}
