import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/module.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ModuleListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  departmentId?: string;
  level?: number;
}

export async function list(query: ModuleListQuery) {
  const { cursor, limit, sort, order, search, status, departmentId, level } = query;
  return repo.list(
    { search, status, departmentId, level },
    { cursor, limit, sort, order },
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
  emitEvent({
    event: 'modules.created',
    entityType: 'Module',
    entityId: result.id,
    actorId: userId,
    data: {
      moduleCode: result.moduleCode,
      title: result.title,
      level: result.level,
      credits: result.credits,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.ModuleUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Module', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'modules.updated',
    entityType: 'Module',
    entityId: id,
    actorId: userId,
    data: { moduleCode: result.moduleCode, title: result.title, status: result.status },
  });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Module', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'modules.deleted',
    entityType: 'Module',
    entityId: id,
    actorId: userId,
    data: { moduleCode: previous.moduleCode },
  });
}
