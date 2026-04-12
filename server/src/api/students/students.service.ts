import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/student.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface StudentListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  moduleId?: string;
  feeStatus?: string;
  entryRoute?: string;
}

export async function list(query: StudentListQuery) {
  const { page, limit, sort, order, search, moduleId, feeStatus, entryRoute } = query;
  return repo.list(
    { search, moduleId, feeStatus, entryRoute },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Student', id);
  return result;
}

export async function create(data: Prisma.StudentUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Student', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('students.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.StudentUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Student', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('students.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Student', id, 'DELETE', userId, previous, null, req);
  await emitEvent('students.deleted', { id });
}
