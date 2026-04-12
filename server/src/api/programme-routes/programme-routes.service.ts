import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/programmeRoute.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ProgrammeRouteListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  studentId?: string;
  programmeId?: string;
  routeCode?: string;
  pathwayCode?: string;
}

export async function list(query: ProgrammeRouteListQuery) {
  const { cursor, limit, sort, order, studentId, programmeId, routeCode, pathwayCode } = query;
  return repo.list(
    { studentId, programmeId, routeCode, pathwayCode },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('StudentProgrammeRoute', id);
  return result;
}

export async function create(data: Prisma.StudentProgrammeRouteUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('StudentProgrammeRoute', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('programme_routes.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.StudentProgrammeRouteUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('StudentProgrammeRoute', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('programme_routes.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('StudentProgrammeRoute', id, 'DELETE', userId, previous, null, req);
  await emitEvent('programme_routes.deleted', { id });
}
