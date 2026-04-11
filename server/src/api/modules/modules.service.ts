import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/module.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ModuleListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  departmentId?: string;
  level?: number;
}

export async function list(query: ModuleListQuery) {
  const { page, limit, sort, order, search, status, departmentId, level } = query;
  return repo.list(
    { search, status, departmentId, level },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Module', id);
  return result;
}

export async function create(data: Prisma.ModuleUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('Module', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('modules.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ModuleUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Module', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('modules.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Module', id, 'DELETE', userId, previous, null, req);
  await emitEvent('modules.deleted', { id });
}
