import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/moduleResult.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ModuleResultListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  moduleId?: string;
  moduleRegistrationId?: string;
  academicYear?: string;
  outcome?: string;
}

export async function list(query: ModuleResultListQuery) {
  const { cursor, limit, sort, order, moduleId, moduleRegistrationId, academicYear, outcome } = query;
  return repo.list(
    { moduleId, moduleRegistrationId, academicYear, outcome },
    { cursor, limit, sort, order },
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
  emitEvent({
    event: 'module_results.created',
    entityType: 'ModuleResult',
    entityId: result.id,
    actorId: userId,
    data: {
      moduleId: result.moduleId,
      moduleRegistrationId: result.moduleRegistrationId,
      academicYear: result.academicYear,
      aggregateMark: result.aggregateMark != null ? Number(result.aggregateMark) : null,
      grade: result.grade,
      status: result.status,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.ModuleResultUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ModuleResult', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'module_results.updated',
    entityType: 'ModuleResult',
    entityId: id,
    actorId: userId,
    data: {
      moduleId: result.moduleId,
      moduleRegistrationId: result.moduleRegistrationId,
      status: result.status,
      grade: result.grade,
      aggregateMark: result.aggregateMark != null ? Number(result.aggregateMark) : null,
    },
  });
  if (result.status !== previous.status) {
    emitEvent({
      event: 'module_results.status_changed',
      entityType: 'ModuleResult',
      entityId: id,
      actorId: userId,
      data: {
        moduleId: result.moduleId,
        moduleRegistrationId: result.moduleRegistrationId,
        previousStatus: previous.status,
        newStatus: result.status,
      },
    });
  }
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ModuleResult', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'module_results.deleted',
    entityType: 'ModuleResult',
    entityId: id,
    actorId: userId,
    data: { moduleId: previous.moduleId, moduleRegistrationId: previous.moduleRegistrationId },
  });
}
