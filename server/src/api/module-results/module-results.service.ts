import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/moduleResult.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ModuleResultListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  moduleId?: string;
  moduleRegistrationId?: string;
  academicYear?: string;
  outcome?: string;
}

export async function list(query: ModuleResultListQuery) {
  const { page, limit, sort, order, moduleId, moduleRegistrationId, academicYear, outcome } = query;
  return repo.list(
    { moduleId, moduleRegistrationId, academicYear, outcome },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ModuleResult', id);
  return result;
}

export async function create(data: Prisma.ModuleResultUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ModuleResult', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('module_results.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ModuleResultUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ModuleResult', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('module_results.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ModuleResult', id, 'DELETE', userId, previous, null, req);
  await emitEvent('module_results.deleted', { id });
}
