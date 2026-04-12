import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/department.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface DepartmentListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  schoolId?: string;
}

export async function list(query: DepartmentListQuery) {
  const { cursor, limit, sort, order, search, schoolId } = query;
  return repo.list(
    { search, schoolId },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Department', id);
  return result;
}

export async function create(data: Prisma.DepartmentUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Department', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('departments.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.DepartmentUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Department', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('departments.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Department', id, 'DELETE', userId, previous, null, req);
  await emitEvent('departments.deleted', { id });
}
