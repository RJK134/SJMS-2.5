import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/programme.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ProgrammeListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  level?: string;
  departmentId?: string;
}

export async function list(query: ProgrammeListQuery) {
  const { page, limit, sort, order, search, status, level, departmentId } = query;
  return repo.list(
    { search, status, level, departmentId },
    { page, limit, skip: (page - 1) * limit, sort, order },
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
  await emitEvent('programmes.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ProgrammeUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Programme', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('programmes.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Programme', id, 'DELETE', userId, previous, null, req);
  await emitEvent('programmes.deleted', { id });
}
