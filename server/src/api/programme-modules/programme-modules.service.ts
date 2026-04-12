import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/programmeModule.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ProgrammeModuleListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  programmeId?: string;
  moduleId?: string;
  yearOfStudy?: number;
  semester?: string;
  moduleType?: string;
}

export async function list(query: ProgrammeModuleListQuery) {
  const { cursor, limit, sort, order, programmeId, moduleId, yearOfStudy, semester, moduleType } = query;
  return repo.list(
    { programmeId, moduleId, yearOfStudy, semester, moduleType },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('ProgrammeModule', id);
  return result;
}

export async function create(data: Prisma.ProgrammeModuleUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('ProgrammeModule', result.id, 'CREATE', userId, null, result, req);
  await emitEvent('programme_modules.created', { id: result.id });
  return result;
}

export async function update(id: string, data: Prisma.ProgrammeModuleUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('ProgrammeModule', id, 'UPDATE', userId, previous, result, req);
  await emitEvent('programme_modules.updated', { id });
  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('ProgrammeModule', id, 'DELETE', userId, previous, null, req);
  await emitEvent('programme_modules.deleted', { id });
}
