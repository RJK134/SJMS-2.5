import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/assessmentAttempt.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface MarkListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  assessmentId?: string;
  moduleRegistrationId?: string;
  attemptNumber?: number;
  status?: string;
}

export async function list(query: MarkListQuery) {
  const { page, limit, sort, order, studentId, assessmentId, moduleRegistrationId, attemptNumber, status } = query;
  return repo.list(
    { studentId, assessmentId, moduleRegistrationId, attemptNumber, status },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('AssessmentAttempt', id);
  return result;
}

export async function create(data: Prisma.AssessmentAttemptUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('AssessmentAttempt', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('marks.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.AssessmentAttemptUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('AssessmentAttempt', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('marks.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('AssessmentAttempt', id, 'DELETE', userId, previous, null, req);
  await emitEvent('marks.deleted', { id });
}
