import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/enrolment.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface EnrolmentListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  programmeId?: string;
  academicYear?: string;
  status?: string;
}

export async function list(query: EnrolmentListQuery) {
  const { page, limit, sort, order, studentId, programmeId, academicYear, status } = query;
  return repo.list(
    { studentId, programmeId, academicYear, status },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Enrolment', id);
  return result;
}

export async function create(data: Prisma.EnrolmentUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create({ ...data, createdBy: userId });
  await logAudit('Enrolment', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('enrolments.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.EnrolmentUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Enrolment', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('enrolments.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Enrolment', id, 'DELETE', userId, previous, null, req);
  await emitEvent('enrolments.deleted', { id });
}
