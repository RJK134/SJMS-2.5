import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/interview.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface InterviewListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  applicationId?: string;
  status?: string;
}

export async function list(query: InterviewListQuery) {
  const { cursor, limit, sort, order, applicationId, status } = query;
  return repo.list(
    { applicationId, status },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Interview', id);
  return result;
}

export async function create(data: Prisma.InterviewUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Interview', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('interviews.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.InterviewUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Interview', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('interviews.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Interview', id, 'DELETE', userId, previous, null, req);
  await emitEvent('interviews.deleted', { id });
}
