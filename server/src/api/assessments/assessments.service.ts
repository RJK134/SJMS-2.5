import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/assessment.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface AssessmentListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  moduleId?: string;
  academicYear?: string;
  assessmentType?: string;
}

export async function list(query: AssessmentListQuery) {
  const { cursor, limit, sort, order, search, moduleId, academicYear, assessmentType } = query;
  return repo.list(
    { search, moduleId, academicYear, assessmentType },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Assessment', id);
  return result;
}

export async function create(data: Prisma.AssessmentUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Assessment', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('assessments.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.AssessmentUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Assessment', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('assessments.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Assessment', id, 'DELETE', userId, previous, null, req);
  await emitEvent('assessments.deleted', { id });
}
